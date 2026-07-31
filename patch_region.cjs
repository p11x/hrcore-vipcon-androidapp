const fs = require('fs');

// Update functions/index.js
let fnCode = fs.readFileSync('functions/index.js', 'utf8');
fnCode = fnCode.replace(
  'exports.changeEmployeePassword = onRequest((req, res) => {',
  'exports.changeEmployeePassword = onRequest({ region: "asia-southeast1" }, (req, res) => {'
);
fs.writeFileSync('functions/index.js', fnCode);

// Update firebase.json
let fbJson = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
const rewrites = fbJson.hosting.rewrites.map(rewrite => {
  if (rewrite.function === 'changeEmployeePassword') {
    return { ...rewrite, region: 'asia-southeast1' };
  }
  return rewrite;
});
fbJson.hosting.rewrites = rewrites;
fs.writeFileSync('firebase.json', JSON.stringify(fbJson, null, 2));
