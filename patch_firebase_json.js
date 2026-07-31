const fs = require('fs');
const json = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));

json.functions = {
  "source": "functions"
};

const rewrites = json.hosting.rewrites || [];
json.hosting.rewrites = [
  {
    "source": "/api/admin/change-employee-password",
    "function": "changeEmployeePassword"
  },
  ...rewrites.filter(r => r.source !== "/api/admin/change-employee-password")
];

fs.writeFileSync('firebase.json', JSON.stringify(json, null, 2));
