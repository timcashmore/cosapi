const axios = require('axios');
const qs = require('querystring');
const data = { 'grant_type': 'client_credentials'};

const options = {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
//  headers: { 'content-type': 'application/json' },
  auth:{
    username: 'sb-dd3064df-4097-411b-b32d-8cf83284e7fb!b59789|customer-order-sourcing-trial!b20218',
    password: '36tXSJFZFL9WvpQEx0Xtcz8Tjzg=',
  },
  data: qs.stringify(data),
//  data: data,
  url: 'https://tc.authentication.eu10.hana.ondemand.com/oauth/token',
}

// Make Call to get Data from COS (availabilityRawData)


