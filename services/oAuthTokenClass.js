// Needed for encoding correctly with axios
const qs = require('querystring');

// Read in environment variables from .env file to get COS Connection Data
require("dotenv").config();
const clientId = process.env.CLIENTID;
const clientSecret = process.env.CLIENTSECRET;
const baseURL = process.env.BASEURL;
const authURL = process.env.AUTHURL;


const data = { 'grant_type': 'client_credentials'};
const JWToptions = {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  auth:{
    username: clientId,
    password: clientSecret,
  },
  data: qs.stringify(data),
  url: authURL,
}

// Class to hold details of an authorisation token to be reused if not expired
class AuthToken {
  constructor(refreshTimeBuffer) {
          this.refreshTimeBuffer = refreshTimeBuffer;
          this.JWToptions = JWToptions;
          this.baseURL = baseURL;
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

      getJWToptions() {
        return this.JWToptions;
      }

      getBaseURL() {
        return this.baseURL;
      }
}
module.exports = AuthToken;
