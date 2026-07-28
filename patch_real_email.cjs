const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /\/\/ Mock sending email to avoid Nodemailer createTestAccount issues in serverless[\s\S]*?res\.json\(\{ success: true, previewUrl: approvalUrl \}\);/m;

const replacement = `
      let transporter;
      
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_PORT === "465",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        console.warn("No SMTP credentials provided in .env, using console.log mock instead");
        console.log("Mocking email send to: " + companyEmail);
        console.log("Approval URL: " + approvalUrl);
        return res.json({ success: true, previewUrl: approvalUrl });
      }

      const info = await transporter.sendMail({
        from: '"HR Core Admin" <noreply@hrcore.app>',
        to: companyEmail,
        subject: "Action Required: Approve New Admin Workspace",
        html: \`
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Admin Workspace Request</h2>
            <p><strong>\${registrantName}</strong> has requested to create a new admin workspace on HR Core.</p>
            <p>Please click the button below to verify and approve this account creation:</p>
            <div style="margin: 30px 0;">
              <a href="\${approvalUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify & Approve Account</a>
            </div>
            <p style="color: #666; font-size: 14px;">If you did not expect this request, you can safely ignore this email.</p>
          </div>
        \`,
      });

      console.log("Message sent: %s", info.messageId);
      res.json({ success: true, previewUrl: approvalUrl });
`;

if (code.match(regex)) {
  code = code.replace(regex, replacement.trim());
  fs.writeFileSync('server.ts', code);
  console.log("Patched successfully");
} else {
  console.log("Could not find regex match");
}
