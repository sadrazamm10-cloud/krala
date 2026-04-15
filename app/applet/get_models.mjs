const https = require('https');

const options = {
  hostname: 'api.sambanova.ai',
  path: '/v1/models',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer 74994ef5-af24-4675-b1e2-84d66ac62486'
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});

req.on('error', error => console.error(error));
req.end();
