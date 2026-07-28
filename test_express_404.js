import express from 'express';
import http from 'http';
const app = express();

const server = app.listen(4002, () => {
  http.get('http://localhost:4002/some-random-path', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Body:', data);
      server.close();
    });
  });
});
