const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("baseUrl = baseUrl.replace('ais-dev-', 'ais-pre-');", "");

fs.writeFileSync('server.ts', code);
