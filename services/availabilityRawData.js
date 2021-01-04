const axios = require('axios');
const qs = require('querystring');
// Update data with product description and a catalog information
const prod = require('./productList.js');

// Make Call to get Data from COS (availabilityRawData)

function makeCalltoGetData(authToken, sendRes) {
  // Do we have an existing access Token ?
  var accessToken = authToken.getAccessToken();
  var baseURL = authToken.getBaseURL();
  console.log('baseURL= ' + baseURL);
  if (accessToken != null) {
    availabilityRawData(accessToken, sendRes, baseURL);
  } else {
    // Make a call to get a new JWT to use in the call to get the data
    var authPromise = axios.request(authToken.getJWToptions());
    authPromise.then(function(res) {
        authToken.setAuthToken(res.data);
        console.log(`New JWT Access Token ${new Date()}`);
        availabilityRawData(authToken.getAccessToken(), sendRes, baseURL);
    }).catch(function(err) {
        console.log("Error getting Access Token = " + err);
    });    
  }
}
// Get Response data, update and send back to the end-user
function availabilityRawData(accessToken, sendRes, baseURL) {
  const availabilityRawCallSettings = {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
    baseURL: baseURL,
    url: '/availabilityRawData',
  }
  //  console.log("in availability");
    var invenPromise = axios.request(availabilityRawCallSettings);
    invenPromise.then(function(resp) {
    // Update the inventory response with product description and catalog
    var productList = prod.readProductList();
    if (productList != null) {prod.updateInventoryList(productList, resp.data)};
    // Send the data back
    sendRes.send(JSON.stringify(resp.data));
    //console.log("availabilityCall response = " + JSON.stringify(data));
  }).catch(function(err) {
    console.log("Error getting availabilityRawData = " + err);
  });
}

module.exports = {makeCalltoGetData, availabilityRawData};


