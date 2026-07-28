const fs = require('fs');
let code = fs.readFileSync('src/pages/employee/DigitalID.tsx', 'utf8');

const regex = /\{\/\* Top Logo Section \*\/\}.*VEPCON Soft Systems Pvt Ltd\s*<\/div>/s;

const replacement = `{/* Top Logo Section */}
          <div className="mt-12 z-10 px-4 text-center">
            <h1 className="text-[#E31E24] text-[24px] font-black uppercase tracking-wide leading-tight drop-shadow-sm">
              {mergedData?.orgName || mergedData?.companyName || 'VEPCON Soft Systems Pvt Ltd'}
            </h1>
          </div>`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/employee/DigitalID.tsx', code);
console.log("Patched DigitalID");
