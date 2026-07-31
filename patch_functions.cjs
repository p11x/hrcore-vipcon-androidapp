const fs = require('fs');
let code = fs.readFileSync('functions/index.js', 'utf8');

code = code.replace(/admin\.auth\(\)/g, 'getAuth()');
code = code.replace('const admin = require("firebase-admin");', 'const admin = require("firebase-admin");\nconst { getAuth } = require("firebase-admin/auth");');

fs.writeFileSync('functions/index.js', code);
