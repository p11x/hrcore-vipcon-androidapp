const fs = require('fs');

const files = [
  'src/pages/admin/ChatList.tsx',
  'src/pages/admin/Clients.tsx',
  'src/pages/admin/Dashboard.tsx',
  'src/pages/admin/EmployeesView.tsx',
  'src/pages/admin/ProjectDetail.tsx',
  'src/pages/employee/Attendance.tsx',
  'src/pages/employee/BankDetails.tsx',
  'src/pages/employee/Chat.tsx',
  'src/pages/employee/Dashboard.tsx',
  'src/pages/employee/DigitalID.tsx',
  'src/pages/employee/Directory.tsx',
  'src/pages/employee/Documents.tsx',
  'src/pages/employee/Education.tsx',
  'src/pages/employee/HolidayCalendar.tsx',
  'src/pages/employee/Leave.tsx',
  'src/pages/employee/Notifications.tsx',
  'src/pages/employee/Profile.tsx',
  'src/pages/employee/ProjectDetail.tsx',
  'src/pages/employee/Projects.tsx',
  'src/pages/employee/SupportTickets.tsx',
  'src/pages/employee/Tasks.tsx',
  'src/pages/employee/VirtualID.tsx',
  'src/pages/Setup.tsx',
  'src/context/AuthContext.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Add tenantId to useAuth if useAuth is present
  if (content.includes('useAuth()') && !content.includes(' tenantId ') && !content.includes('{ tenantId }')) {
    content = content.replace(/const { ([^}]+) } = useAuth\(\)/g, (match, p1) => {
      if (!p1.includes('tenantId')) {
        return `const { ${p1}, tenantId } = useAuth()`;
      }
      return match;
    });
  }

  // Also need to add `if (!tenantId) return` inside useEffects if not present.
  // This is harder to do via regex. Let's at least inject `tenantId` into the destructured object.
  // Sometimes it's `const auth = useAuth()`, then we need `auth.tenantId`.
  
  if (content !== original) {
    console.log(`Fixed tenantId in ${file}`);
    fs.writeFileSync(file, content, 'utf8');
  }
});
