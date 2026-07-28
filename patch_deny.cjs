const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const denyEndpoint = `
  app.post("/api/deny-registration", (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Missing token" });
    if (pendingRegistrations.has(token)) {
      pendingRegistrations.delete(token);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Token not found" });
    }
  });
`;

code = code.replace('  app.get("/api/get-all-pending-registrations"', denyEndpoint + '\n  app.get("/api/get-all-pending-registrations"');

fs.writeFileSync('server.ts', code);
