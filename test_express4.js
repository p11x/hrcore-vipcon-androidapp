import express from 'express';
import http from 'http';
import path from 'path';
const app = express();

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'non-existent-file.html'));
});
const server = app.listen(4001, () => {
  http.get('http://localhost:4001/pending-approvals', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Body:', data);
      server.close();
    });
  });
});
