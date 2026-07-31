const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/EmployeeProfile.tsx', 'utf8');

code = code.replace(/let data;\n\s*try \{\n\s*data = await response\.json\(\)\n\s*\} catch \(e\) \{\n\s*throw new Error\('Server returned an invalid response\. Please ensure Firebase is correctly configured\.'\)\n\s*\}/, `let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Raw response:", text);
        throw new Error('Server returned an invalid response. Raw: ' + text.substring(0, 100));
      }`);

fs.writeFileSync('src/pages/admin/EmployeeProfile.tsx', code);
