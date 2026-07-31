const fs = require('fs');
let code = fs.readFileSync('functions/index.js', 'utf8');
code = code.replace('{ region: "asia-southeast1" }', '{ region: "asia-southeast1", cors: true, invoker: "public" }');
fs.writeFileSync('functions/index.js', code);
