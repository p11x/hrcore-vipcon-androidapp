import express from 'express';
const app = express();

const tests = [
  '/',
  '*',
  '/*',
  '/(.*)',
  '/:path(*)',
  '/{*path}',
  '/{*foo}'
];

for (const t of tests) {
  try {
    app.get(t, (req, res) => res.send(t));
    console.log('SUCCESS:', t);
  } catch (e) {
    console.log('FAILED:', t, e.message);
  }
}
