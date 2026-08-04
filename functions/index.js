const { onRequest } = require("firebase-functions/v2/https");
const { getAuth } = require("firebase-admin/auth");
const admin = require("firebase-admin");

admin.initializeApp();

exports.changepassword = onRequest({
  region: "asia-southeast1",
  cors: true,
  invoker: "public"
}, async (req, res) => {
  // Manual check for POST since we removed the cors wrapper which sometimes hides method mismatch
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("No bearer token provided");
    return res.status(401).json({ error: "Unauthorized: Missing Token" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);

    // Check if the user is an admin
    if (decodedToken.role !== 'admin' && decodedToken.email !== 'admin@hrcore.dev') {
       console.error("User is not an admin", decodedToken.email);
       return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    const { uid, newPassword } = req.body;
    if (!uid || !newPassword) {
      return res.status(400).json({ error: "Missing uid or newPassword" });
    }

    await getAuth().updateUser(uid, { password: newPassword });
    console.log(`Successfully updated password for UID: ${uid}`);
    return res.json({ success: true });
  } catch (error) {
    console.error("Error in changepassword function:", error);
    return res.status(500).json({ error: error.message });
  }
});