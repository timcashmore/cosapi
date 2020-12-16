const express = require('express');
const app = express();
const passport = require("passport");
const { JWTStrategy } = require('@sap/xssec');
const xsenv = require('@sap/xsenv');

// XSUAA Middleware
passport.use(new JWTStrategy(xsenv.getServices({uaa:{tag:'xsuaa'}}).uaa));

app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));

// For local testing = read a local file
const fs = require('fs');
var inventoryList;
inventoryList = JSON.parse(fs.readFileSync('./LocalData/Products.json'));
// Use standard node.js to get an oAUth Token
var request = require('request');
var accessToken = "";
console.log("call cos api if possible");
request({
  url: 'https://tc.authentication.eu10.hana.ondemand.com/oauth/token',
  method: 'POST',
  auth: {
    user: 'sb-dd3064df-4097-411b-b32d-8cf83284e7fb!b59789|customer-order-sourcing-trial!b20218',
    pass: '36tXSJFZFL9WvpQEx0Xtcz8Tjzg='
  },
  form: {
    'grant_type': 'client_credentials'
  }
}, function(err, res) {
  var json = JSON.parse(res.body);
  accessToken = json.access_token;
  console.log("Access Token:", accessToken);
});
// Now lets call the inventory API (availabilityRawData)
console.log("Call API availabilityRawData, access token:", accessToken);
request({
  url: 'https://cpfs-dtrt-trial.cfapps.eu10.hana.ondemand.com/v1/availabilityRawData',
  auth: {
    'bearer': accessToken
  }
}, function(err, res) {
  console.log("Get Data" + err);
  console.log(res.body);
});  


//Define Simple route to return inventory JSON
app.get('/api/inventory', checkInventoryScope, (req, res) => {
    if (inventoryList != null) {
      res.send(inventoryList);
     }
});

// Listen on Port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('cosapi listening on port ' + port);
});

// Check auth scopes
function checkInventoryScope(req, res, next) {
    console.log("In inventory scope check");
    if (req.authInfo.checkLocalScope('inventory')) {
		return next();
	} else {
    	console.log('Missing the expected scope');
    	res.status(403).end('Forbidden');
	} 
}








