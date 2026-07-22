const fs = require('fs');
let code = fs.readFileSync('src/pages/employee/Profile.tsx', 'utf8');

code = code.replace(
  `        } catch (error: any) {
          reset({ email: user.email || '' })`,
  `        } catch {
          reset({ email: user.email || '' })`
);

fs.writeFileSync('src/pages/employee/Profile.tsx', code);
