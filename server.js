const express = require('express');
const app = express();
const passport = require("passport");
const { JWTStrategy } = require('@sap/xssec');
const xsenv = require('@sap/xsenv');
// AvailabilityRawData Processing
const inventory = require('./services/availabilityRawData');
// Used for authorisation
const AuthToken = require('./services/oAuthTokenClass.js');
//Used for local testing - pass it on the commenad line
const local = process.env.LOCAL == 'true' ? true : false;

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
var multer = require('multer');
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
 
var upload = multer({ storage: storage });

//app.post('/api/produpload', checkInventoryScope, upload.single('prodFile.csv'), (req, res) => {
app.post('/api/produpload', checkInventoryScope, upload.single('prodFile'), (req, res) => {
  console.log('api/produpload' + req.file);
  res.send("Hello");
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