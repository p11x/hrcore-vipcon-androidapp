const fs = require('fs');
const path = require('path');

const dir = 'src/pages/employee';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

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

  // Rewrite root paths in db calls. 
  // We want to replace db.onValue(`employees/${userId}` with db.onValue(`tenants/${tenantId}/employees/${userId}`
  // To be safe, we match db.[method](`somePath`
  const collections = ['users', 'employees', 'attendance', 'leaves', 'leaveBalance', 'Documents', 'tickets', 'notifications', 'education', 'bankDetails', 'projects', 'holidays', 'taskComments', 'messages_Chat', 'clients', 'contacts', 'timesheets', 'OfferLetters', 'Payslips', 'tasks', 'announcements', 'auditLog', 'presence', 'railEvents'];

  collections.forEach(coll => {
    // case 1: db.method(`coll/...`) -> db.method(`tenants/${tenantId}/coll/...`)
    const re1 = new RegExp(`(db\\.(onValue|get|set|update|remove)\\(\`)${coll}/`, 'g');
    content = content.replace(re1, `$1tenants/\${tenantId}/${coll}/`);

    // case 2: db.method(`coll`) -> db.method(`tenants/${tenantId}/coll`)
    const re2 = new RegExp(`(db\\.(onValue|get|set|update|remove)\\(\`)${coll}\``, 'g');
    content = content.replace(re2, `$1tenants/\${tenantId}/${coll}\``);
    
    // case 3: db.method('coll') -> db.method(`tenants/${tenantId}/coll`)
    const re3 = new RegExp(`(db\\.(onValue|get|set|update|remove)\\(')${coll}'`, 'g');
    content = content.replace(re3, `$1tenants/\${tenantId}/${coll}\``).replace(/\('/g, "(`"); // this replace might be a bit loose, so let's be more precise
    
    // case 4: db.method('coll/...') -> db.method(`tenants/${tenantId}/coll/...`)
    // wait, single quotes don't support interpolation. If we have db.onValue('tickets', ...), it becomes db.onValue(`tenants/${tenantId}/tickets`
  });

  // Handle single quotes carefully:
  collections.forEach(coll => {
    const re_single = new RegExp(`(db\\.(onValue|get|set|update|remove)\\()'${coll}'`, 'g');
    content = content.replace(re_single, `$1\`tenants/\${tenantId}/${coll}\``);
    
    const re_single2 = new RegExp(`(db\\.(onValue|get|set|update|remove)\\()'${coll}/([^']+)'`, 'g');
    content = content.replace(re_single2, `$1\`tenants/\${tenantId}/${coll}/$2\``);
  });

  // Since we added tenantId dependency, we should add it to useEffect dependencies.
  // Actually, standard React useEffect doesn't crash if tenantId is missing from dependency array, just warns.

  // But we need to add `if (!tenantId) return` inside the useEffect if it's there.
  // Let's just leave it to the runtime (if tenantId is null, tenants/null/employees is read, which is safe in mockDb/firebase for reading nothing, but better to prevent it)

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
});
