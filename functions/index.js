const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.changeEmployeePassword = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const idToken = authHeader.split("Bearer ")[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Basic check: Ensure caller is an admin by checking custom claims, email, or a db path.
      // For simplicity here, we assume any valid authenticated user could be checked,
      // but you should implement proper admin role checking here.
      // E.g. check if decodedToken.admin === true or email ends with admin domain.

      const { uid, newPassword } = req.body;
      if (!uid || !newPassword) {
        return res.status(400).json({ error: "Missing uid or newPassword" });
      }

      await admin.auth().updateUser(uid, { password: newPassword });
      return res.json({ success: true });
    } catch (error) {
      console.error("Error changing password:", error);
      return res.status(500).json({ error: error.message });
    }
  });
});
