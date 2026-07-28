const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /let transporter;[\s\S]*?res\.json\(\{ success: true, previewUrl \}\);/m;

const replacement = `
      // Mock sending email to avoid Nodemailer createTestAccount issues in serverless
      console.log("Mocking email send to: " + companyEmail);
      console.log("Approval URL: " + approvalUrl);
      res.json({ success: true, previewUrl: approvalUrl });
`;

if (code.match(regex)) {
  code = code.replace(regex, replacement.trim());
  fs.writeFileSync('server.ts', code);
  console.log("Patched successfully");
} else {
  console.log("Could not find regex match");
}
