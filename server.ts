import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import cors from "cors";
import * as admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

try {
  admin.initializeApp();
} catch (e) {}



async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // In-memory store for pending registrations (since we can't deploy RTDB rules easily)
  const pendingRegistrations = new Map<string, any>();

  // Email route
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
        `,
      });

      console.log("Message sent: %s", info.messageId);
      res.json({ success: true, previewUrl: approvalUrl });
    } catch (error: any) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: error.message });
    }
  });

  
  app.post("/api/admin/change-employee-password", async (req, res) => {
    const { uid, newPassword } = req.body;
    if (!uid || !newPassword) return res.status(400).json({ error: "Missing uid or newPassword" });
    try {
      await getAuth().updateUser(uid, { password: newPassword });
      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to update password", error);
      let errorMessage = error.message || "Unknown error";
      if (errorMessage.includes("identitytoolkit.googleapis.com")) {
        errorMessage = "Service Account missing. Please use the 'Send Password Reset Email' option instead.";
      }
      return res.status(500).json({ error: errorMessage });
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
    const token = req.query.token as string;
    if (!token) return res.status(400).json({ error: "Missing token" });

    const data = pendingRegistrations.get(token);
    if (!data) return res.status(404).json({ error: "Token expired or invalid" });

    // Since it's a one-time use token, we delete it immediately upon fetching to prevent replay
    pendingRegistrations.delete(token);

    res.json(data);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('/{*path}', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
