const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Add tenantId to useAuth destructuring if not present, but wait, this could be tricky.
  // Instead, let's just find `db.onValue`, `db.set`, `db.get`, `db.update`, `db.remove` and replace root paths
  // Collections: users, employees, attendance, leaves, Documents, tickets, notifications, education, bankDetails, projects, holidays, taskComments, messages_Chat, clients, contacts, timesheets, OfferLetters, Payslips, tasks, presence, railEvents, announcements, auditLog
  
  const collections = ['users', 'employees', 'attendance', 'leaves', 'Documents', 'tickets', 'notifications', 'education', 'bankDetails', 'projects', 'holidays', 'taskComments', 'messages_Chat', 'clients', 'contacts', 'timesheets', 'OfferLetters', 'Payslips', 'tasks', 'announcements', 'auditLog', 'leaveBalance'];

  collections.forEach(coll => {
    // Regex to match db.something('coll/... or `coll/...
    const regex1 = new RegExp(`(db\\.(onValue|get|set|remove|update)\\()(['"])\/?${coll}`, 'g');
    content = content.replace(regex1, `$1\`tenants/\${tenantId}/${coll}`);

    const regex2 = new RegExp(`(db\\.(onValue|get|set|remove|update)\\()(\`)\/?${coll}`, 'g');
    content = content.replace(regex2, `$1\`tenants/\${tenantId}/${coll}`);
  });

  if (content !== original) {
    console.log(`Updated ${file}`);
    fs.writeFileSync(file, content, 'utf8');
  }
});
