const fs = require('fs');
let code = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

code = code.replace(/const snap = await db.get\(\`users\/\$\{firebaseUser.uid\}\`\)\s*if \(\!snap.exists\(\)\) \{/g, 
`let snap = await db.get(\`users/\${firebaseUser.uid}\`)
              if (!snap.exists()) {
                await new Promise(resolve => setTimeout(resolve, 2000))
                snap = await db.get(\`users/\${firebaseUser.uid}\`)
              }
              if (!snap.exists()) {`);

fs.writeFileSync('src/context/AuthContext.tsx', code);
