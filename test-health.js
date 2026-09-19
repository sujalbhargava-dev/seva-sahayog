const http = require('https');
const data = JSON.stringify({ email: "test@example.com", password: "password123" });
const options = {
  hostname: 'sewashayog-api-582b42f2-9812-4c0f-8101-301f0e267d03.fly.dev',
  port: 443,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};
const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => responseData += chunk);
  res.on('end', () => console.log('Response:', responseData, 'Status:', res.statusCode));
});
req.on('error', (err) => console.error('Error:', err.message));
req.write(data);
req.end();
