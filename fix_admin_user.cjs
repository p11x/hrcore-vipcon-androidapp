const fs = require('fs');
let code = fs.readFileSync('src/mock/seedData.ts', 'utf8');

const adminUser = `
    'admin-001': {
      id: 'admin-001',
      email: 'admin@hrcore.dev',
      tenantId: 'mock-tenant-1',
      fullName: 'Admin User',
      phone: '+1 555 9999',
      companyName: 'Acme Corp',
      position: 'Administrator',
      role: 'admin',
    },
`;

code = code.replace(/users: \{/, 'users: {\n' + adminUser);
fs.writeFileSync('src/mock/seedData.ts', code);
