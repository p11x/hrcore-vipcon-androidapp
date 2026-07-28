const fs = require('fs');
let code = fs.readFileSync('src/pages/employee/Chat.tsx', 'utf8');
const replacement = `  if (!chatEnabled) {
    return (
      <PageShell title="Chat Disabled">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-xl font-bold text-text-hi mb-2">Access Denied</h2>
          <p className="text-text-mid text-center max-w-md">Your chat access has been disabled by the administrator. Please contact your HR department if you believe this is a mistake.</p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Chats">`;
code = code.replace(/  return \(\n    <PageShell title="Chats">/, replacement);
fs.writeFileSync('src/pages/employee/Chat.tsx', code);
