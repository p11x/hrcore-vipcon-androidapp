const fs = require('fs');
const path = require('path');

const dir = 'src/pages/employee';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const collections = ['users', 'employees', 'attendance', 'leaves', 'leaveBalance', 'Documents', 'tickets', 'notifications', 'education', 'bankDetails', 'projects', 'holidays', 'taskComments', 'messages_Chat', 'clients', 'contacts', 'timesheets', 'OfferLetters', 'Payslips', 'tasks', 'announcements', 'auditLog', 'presence', 'railEvents'];

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Add tenantId to useAuth if not present
  if (content.includes('useAuth()') && !content.includes(' tenantId ') && !content.includes('{ tenantId }')) {
    content = content.replace(/const { ([^}]+) } = useAuth\(\)/g, (match, p1) => {
      if (!p1.includes('tenantId')) {
        return `const { ${p1}, tenantId } = useAuth()`;
      }
      return match;
    });
  }

  // Find all db calls
  const dbRegex = /db\.(onValue|set|update|remove|get)\(\s*([`'])([^`']+)\2/g;
  
  content = content.replace(dbRegex, (match, method, quote, pathStr) => {
    // Check if pathStr starts with a collection name
    const parts = pathStr.split('/');
    const collName = parts[0];
    
    if (collections.includes(collName)) {
      return `db.${method}(\`tenants/\${tenantId}/${pathStr}\``;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
});
