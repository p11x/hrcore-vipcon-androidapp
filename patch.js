const fs = require('fs');
let code = fs.readFileSync('src/pages/Setup.tsx', 'utf8');
code = code.replace(
  'await createUserWithEmailAndPassword(auth, email, password)',
  `const cred = await createUserWithEmailAndPassword(auth, email, password)
      const db = await getDatabase()
      await db.set(\`users/\${cred.user.uid}\`, {
        email,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        status: 'active',
        createdAt: new Date().toISOString()
      })
      await db.set('Config/setupComplete', true)`
);
fs.writeFileSync('src/pages/Setup.tsx', code);
