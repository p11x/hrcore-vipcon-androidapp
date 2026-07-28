import express from 'express';
import http from 'http';
const app = express();

app.get('/{*path}', (req, res) => {
  res.send('catchall');
});
const server = app.listen(4000, () => {
  http.get('http://localhost:4000/pending-approvals', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Body:', data);
      server.close();
    });
  });
});
