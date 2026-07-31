const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// replace await admin.auth().updateUser(uid, { password: newPassword });
// with await getAuth().updateUser(uid, { password: newPassword });
code = code.replace(/await admin\.auth\(\)\.updateUser/, 'await getAuth().updateUser');

// import getAuth
if (!code.includes("firebase-admin/auth")) {
  code = code.replace(/import \* as admin from "firebase-admin";/, 'import * as admin from "firebase-admin";\nimport { getAuth } from "firebase-admin/auth";');
}

fs.writeFileSync('server.ts', code);
