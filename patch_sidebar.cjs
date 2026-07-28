const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Add chatEnabled state
code = code.replace(
  /const \[companyName, setCompanyName\] = useState\('Vepcon Soft Systems'\)/,
  "const [companyName, setCompanyName] = useState('Vepcon Soft Systems')\n  const [chatEnabled, setChatEnabled] = useState(true)"
);

// Read chatEnabled from DB
code = code.replace(
  /if \(data\?\.companyName\) \{\n\s*setCompanyName\(data\.companyName\)\n\s*\}/,
  `if (data?.companyName) {
          setCompanyName(data.companyName)
        }
        if (data?.chatEnabled !== undefined) {
          setChatEnabled(data.chatEnabled)
        }`
);

// Filter navItems
code = code.replace(
  /const navItems = isAdmin \? adminNavItems : employeeNavItems/,
  `let navItems = isAdmin ? adminNavItems : employeeNavItems;
  if (!isAdmin && !chatEnabled) {
    navItems = navItems.filter(item => item.label !== 'Chat');
  }`
);

fs.writeFileSync('src/components/Sidebar.tsx', code);
