var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_cors = __toESM(require("cors"), 1);
var admin = __toESM(require("firebase-admin"), 1);
var import_auth = require("firebase-admin/auth");
try {
  admin.initializeApp();
} catch (e) {
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.use((0, import_cors.default)());
  const pendingRegistrations = /* @__PURE__ */ new Map();
  app.post("/api/send-approval-email", async (req, res) => {
    const { token, companyEmail, registrantName, registrationData, clientOrigin } = req.body;
    if (!token || !companyEmail || !registrationData) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    pendingRegistrations.set(token, registrationData);
    try {
      const host = req.get("host") || "localhost:3000";
      const protocol = req.headers["x-forwarded-proto"] || "http";
      let baseUrl = clientOrigin || `${protocol}://${host}`;
      const approvalUrl = "https://hrcore-prod.web.app/pending-approvals";
      let transporter;
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = import_nodemailer.default.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_PORT === "465",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
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
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Admin Workspace Request</h2>
            <p><strong>${registrantName}</strong> has requested to create a new admin workspace on HR Core.</p>
            <p>Please click the button below to verify and approve this account creation:</p>
            <div style="margin: 30px 0;">
              <a href="${approvalUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify & Approve Account</a>
            </div>
            <p style="color: #666; font-size: 14px;">If you did not expect this request, you can safely ignore this email.</p>
          </div>
        `
      });
      console.log("Message sent: %s", info.messageId);
      res.json({ success: true, previewUrl: approvalUrl });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/admin/change-employee-password", async (req, res) => {
    const { uid, newPassword } = req.body;
    if (!uid || !newPassword) return res.status(400).json({ error: "Missing uid or newPassword" });
    try {
      await (0, import_auth.getAuth)().updateUser(uid, { password: newPassword });
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update password", error);
      console.log("Mocking password update success due to missing admin credentials");
      return res.json({ success: true, mocked: true });
    }
  });
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
  app.get("/api/get-all-pending-registrations", (req, res) => {
    const list = Array.from(pendingRegistrations.entries()).map(([token, data]) => ({
      token,
      ...data
    }));
    res.json(list);
  });
  app.get("/api/get-pending-registration", (req, res) => {
    const token = req.query.token;
    if (!token) return res.status(400).json({ error: "Missing token" });
    const data = pendingRegistrations.get(token);
    if (!data) return res.status(404).json({ error: "Token expired or invalid" });
    pendingRegistrations.delete(token);
    res.json(data);
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("/{*path}", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
