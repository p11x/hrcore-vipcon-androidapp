const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  'const approvalUrl = `${baseUrl}/pending-approvals`;',
  'const approvalUrl = "https://hrcore-prod.web.app/pending-approvals";'
);
fs.writeFileSync('server.ts', code);
