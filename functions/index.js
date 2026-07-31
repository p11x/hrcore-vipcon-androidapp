const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.changeEmployeePassword = onRequest({ region: "asia-southeast1", cors: true, invoker: "public" }, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await getAuth().verifyIdToken(idToken);
      const { uid, newPassword } = req.body;

      if (!uid || !newPassword) {
        return res.status(400).json({ error: "Missing uid or newPassword" });
      }

      await getAuth().updateUser(uid, { password: newPassword });
      return res.json({ success: true });
    } catch (error) {
      console.error("Error changing password:", error);
      return res.status(500).json({ error: error.message });
    }
  });
});
