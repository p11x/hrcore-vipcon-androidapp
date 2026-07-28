import express from 'express';
import request from 'supertest';
const app = express();

app.get('/{*path}', (req, res) => {
  res.send('catchall');
});

request(app).get('/pending-approvals').expect(200).then(res => {
  console.log('Got response:', res.text);
}).catch(err => {
  console.error('Error:', err.message);
});
