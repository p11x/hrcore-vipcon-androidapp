const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const effectCode = `  useEffect(() => {
    if (!user?.uid || !tenantId) return
    let unsub = () => {}
    getDatabase().then((db: any) => {
      if (isAdmin) {
        // Admin gets company name from organization settings or their own users/ profile if added there.
        // Actually, org name is at organizations/\${tenantId}/name
        unsub = db.onValue(\`organizations/\${tenantId}\`, (snapshot: any) => {
          const data = snapshot.val()
          if (data?.name) {
            setCompanyName(data.name)
          }
        })
      } else {
        unsub = db.onValue(\`tenants/\${tenantId}/employees/\${user.uid}\`, (snapshot: any) => {
          const data = snapshot.val()
          if (data?.companyName) {
            setCompanyName(data.companyName)
          }
          if (data?.chatEnabled !== undefined) {
            setChatEnabled(data.chatEnabled)
          }
        })
      }
    })
    return () => unsub()
  }, [isAdmin, user?.uid, tenantId])`;

code = code.replace(/  useEffect\(\(\) => \{\n    if \(isAdmin \|\| !user\?\.uid \|\| !tenantId\) return[\s\S]*?  \}, \[isAdmin, user\?\.uid, tenantId\]\)/, effectCode);

fs.writeFileSync('src/components/Sidebar.tsx', code);
