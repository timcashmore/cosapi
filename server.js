const express = require('express');
const app = express();
const passport = require("passport");
const { JWTStrategy } = require('@sap/xssec');
const xsenv = require('@sap/xsenv');
// Update data with product description and a catalog information
const prod = require('./services/productList.js');
var productList = prod.readProductList();
// Required for calls to COS
const axios = require('axios');
const qs = require('querystring');
const AuthToken = require('./services/oAuthTokenClass.js');

// COS Connection Data
const baseURL = "https://cpfs-dtrt-trial.cfapps.eu10.hana.ondemand.com/v1";
const data = { 'grant_type': 'client_credentials'};
const JWToptions = {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  auth:{
    username: 'sb-dd3064df-4097-411b-b32d-8cf83284e7fb!b59789|customer-order-sourcing-trial!b20218',
    password: '36tXSJFZFL9WvpQEx0Xtcz8Tjzg=',
  },
  data: qs.stringify(data),
  url: 'https://tc.authentication.eu10.hana.ondemand.com/oauth/token',
}
// Set up a new object to capture the accss token
var authToken = new AuthToken(5);

// XSUAA Middleware (comment out lines below for local testing)
passport.use(new JWTStrategy(xsenv.getServices({uaa:{tag:'xsuaa'}}).uaa));
app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));

//Define Simple route to return inventory JSON (remove check scope for local testing)
app.get('/api/inventory', checkInventoryScope, (req, res) => {
    makeCalltoGetData(authToken.getAccessToken(),res);  
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
//Calls to COS to get the data
function makeCalltoGetData(accessToken, sendRes) {
  // Do we have an existing access Token ?
  if (accessToken != null) {
    availabilityRawData(accessToken, sendRes);
  } else {
    // Make a call to get a new JWT to use in the call to get the data
    var authPromise = axios.request(JWToptions);
    authPromise.then(function(res) {
        authToken.setAuthToken(res.data);
        console.log(`New JWT Access Token ${new Date()}`);
        availabilityRawData(authToken.getAccessToken(), sendRes);
    }).catch(function(err) {
        console.log("Error getting Access Token = " + err);
    });    
  }
}
// Get Response data, update and send back to the end-user
function availabilityRawData(accessToken, sendRes) {
  const availabilityRawCallSettings = {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
    url: 'https://cpfs-dtrt-trial.cfapps.eu10.hana.ondemand.com/v1/availabilityRawData',
  }
  //  console.log("in availability");
    var getPromise = axios.request(availabilityRawCallSettings);
    getPromise.then(function(resp) {
    // Update the inventory response with product description and catalog
    if (productList != null) {prod.updateInventoryList(productList, resp.data) };
    // Send the data back
    sendRes.send(JSON.stringify(resp.data));
    //console.log("availabilityCall response = " + JSON.stringify(data));
  }).catch(function(err) {
    console.log("Error getting availabilityRawData = " + err);
  });
}
