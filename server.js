const express = require('express');
const app = express();
const passport = require("passport");
const { JWTStrategy } = require('@sap/xssec');
const xsenv = require('@sap/xsenv');
// AvailabilityRawData Processing
const inventory = require('./services/availabilityRawData');

// Used for authorisation
const AuthToken = require('./services/oAuthTokenClass.js');

// Used to load up product descriptions
const prod = require('./services/productList.js');
prod.readCSVProdList();   // Store latest product descriptions in an array on start-up

//Used for local testing - pass it on the commenad line
const local = process.env.START_LOCAL == 'true' ? true : false;

// Set up a new object to capture the accsss token to COS
var authToken = new AuthToken(5);

// XSUAA Middleware (only in production)
if (!local) {
  passport.use(new JWTStrategy(xsenv.getServices({uaa:{tag:'xsuaa'}}).uaa));
  app.use(passport.initialize());
  app.use(passport.authenticate('JWT', { session: false }));
}

//Define route to return inventory JSON
app.get('/api/inventory', checkInventoryScope, (req, res) => {
   inventory.makeCalltoGetData(authToken, res);  
});

// Define route to receive and update product list file from a csv
const multer = require('multer');
//var upload = multer({ dest: './LocalData/' })
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './LocalData/')
  },
  filename: function (req, file, cb) {
//    cb(null, file.fieldname)
      cb(null, 'prodFile.csv');
  }
})
const upload = multer({ storage: storage });

app.post('/api/produpload', checkInventoryScope, upload.single('prodFile'), (req, res) => {
  // Process Updated file and make it available in memory for processing
  console.log('POST api/produpload' + req.file);
  prod.readCSVProdList();   // Store latest product descriptions when a new file is received
  res.send('File Upload Response')
}); 
// Needed for a CSRF token request
app.get('/api/produpload', checkInventoryScope, (req, res) => {
  console.log('GET api/produpload');
  res.send('Token Response')
});

// Listen on Port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('cosapi listening on port ' + port);
});
// Check auth scopes
function checkInventoryScope(req, res, next) {   
  console.log("In inventory scope check - Local = " + local);
    if (!local) {
        if (req.authInfo.checkLocalScope('inventory')) {
          return next();
        } else {
            console.log('Missing the expected scope');
            res.status(403).end('Forbidden');
        }       
    }
    return next(); 
}