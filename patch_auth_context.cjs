const fs = require('fs');
let code = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

code = code.replace(/} catch \(error: any\) \{\s*if \(error\.message === 'Your account has been disabled or deleted\.'\) \{\s*throw error\s*}\s*}/g, 
`} catch (error: any) {
      throw error;
    }`);

fs.writeFileSync('src/context/AuthContext.tsx', code);
