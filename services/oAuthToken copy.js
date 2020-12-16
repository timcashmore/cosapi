const axios = require('axios');
const qs = require('querystring');
// Class to hold details of an authorisation token to be reused if not expired
class AuthToken {
  constructor(refreshTimeBuffer) {
          this.refreshTimeBuffer = refreshTimeBuffer;
      }
      setAuthToken(authToken) {
          this.authToken = authToken;
          this.accessToken = authToken.access_token;
          this.expiresIn = authToken.expires_in;
          this.tokenType = authToken.token_type;
          this.scope = authToken.scope;
          this.startTimeToken = Date.now();
      }
      getAuthToken() {
          return this.authToken;
      }
      getAccessToken() {
          //Check if accesToken has not expired else return null
          var tokenTTL =  this.expiresIn - (Date.now() - this.startTimeToken)/1000;
          console.log(`TTL =  ${tokenTTL - this.refreshTimeBuffer}`);
          if (tokenTTL >= this.refreshTimeBuffer) {
              return this.accessToken;
           } 
           else if (this.expiresIn) {
              console.log("Auth JWT expired"); 
              return null;
           } 
           else {
              console.log("Auth JWT Not Available"); 
              return null;
           }
      }
      getTokenTTL() {
          var currentTokenTTL =  (Date.now() - this.startTimeToken)/1000;
          return this.expiresIn - currentTokenTTL;
      }
}
// Connection Data
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
//  data: data,
  url: 'https://tc.authentication.eu10.hana.ondemand.com/oauth/token',
}

// Set up a new object to capture the accss token
var authToken = new AuthToken(5);

// Test run
makeCalltoGetData(authToken.getAccessToken());

// Fetech a new authorisation token with a promise
/*
    var authPromise = axios.request(JWToptions);

    authPromise.then(function(res) {
    authToken.setAuthToken(res.data);
//    console.log(authToken.getAccessToken()); 
    console.log(`New JWT Access Token ${new Date()}`);
    availabilityRawData(authToken.getAccessToken());
}).catch(function(err) {
  console.log("Error getting Access Token = " + err);
});
*/

function makeCalltoGetData(accessToken) {
  // Do we have an existing access Token ?
  if (accessToken != null) {
    availabilityRawData(accessToken);
  } else {
    // Make a call to get a new JWT to use in the call to get the data
    var authPromise = axios.request(JWToptions);
    authPromise.then(function(res) {
        authToken.setAuthToken(res.data);
        console.log(`New JWT Access Token ${new Date()}`);
        availabilityRawData(authToken.getAccessToken());
    }).catch(function(err) {
        console.log("Error getting Access Token = " + err);
    });    
  }
}

// Get Response data, update and send back to the end-user
function availabilityRawData(accessToken) {
  const availabilityRawCallSettings = {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
    url: 'https://cpfs-dtrt-trial.cfapps.eu10.hana.ondemand.com/v1/availabilityRawData',
  }
  console.log("in availability");
  var getPromise = axios.request(availabilityRawCallSettings);
  getPromise.then(function(resp) {
    var data = resp.data;
    // Send the data back
    console.log("availabilityCall response = " + JSON.stringify(data));
  }).catch(function(err) {
    console.log("Error getting availabilityRawData = " + err);
  });
}

module.exports = { AuthToken, makeCalltoGetData };




// Test timer
/*setTimeout( () => {
    authToken.getAccessToken();
    console.log(`Token TTL = ${authToken.getTokenTTL()}`);
}, 10000, authToken);*/

