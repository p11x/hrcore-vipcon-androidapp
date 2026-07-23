const fs = require('fs');

const file = 'src/mock/seedData.ts';
let content = fs.readFileSync(file, 'utf8');

// We want to transform the root object to:
// {
//   tenants: {
//     'mock-tenant-1': { ...all_existing_data... }
//   },
//   users: { ...all_existing_users_but_with_tenantId... },
//   organizations: { 'mock-tenant-1': { name: 'Acme Corp', adminId: 'admin-001' } }
// }
// Wait, the easiest way is to modify it via string replacement or just eval it, modify it, and write it back.
// Since it's an export const, we can just replace the start.

content = content.replace('export const seedData = {', `export const seedData = {
  organizations: {
    'mock-tenant-1': {
      name: 'Acme Corp',
      createdAt: '2026-01-01T00:00:00Z',
      adminId: 'admin-001'
    }
  },
  tenants: {
    'mock-tenant-1': {`);

// We need to close the `tenants: { 'mock-tenant-1': {` at the very end.
content = content.replace(/,\n  Config: {/g, '  },\n  Config: {');

// Wait, the users also need `tenantId: 'mock-tenant-1'`
// The string is big, let's just use regex to add tenantId to users.
content = content.replace(/email: '([^']+)',/g, (match, email) => {
  return `${match}\n      tenantId: 'mock-tenant-1',`;
});

// We need users at the root so AuthContext can verify them.
// Currently users is inside `tenants.mock-tenant-1.users` after our first replacement.
// But wait! AuthContext queries `users/${firebaseUser.uid}` which is root!
// So users should be at root as well.
fs.writeFileSync(file, content, 'utf8');
