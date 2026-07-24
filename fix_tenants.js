import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, get, update } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAAScuTOEX6RXxRnZB-pP8yOrWPTRUIqt0",
  authDomain: "hrcore-prod.firebaseapp.com",
  databaseURL: "https://hrcore-prod-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hrcore-prod",
  storageBucket: "hrcore-prod.firebasestorage.app",
  messagingSenderId: "987763242101",
  appId: "1:987763242101:web:90ff6e3725f9b461a3743c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

async function fixTenants() {
  try {
    await signInWithEmailAndPassword(auth, 'admin2@hrcore.dev', 'admin123');
    
    const usersSnap = await get(ref(db, `users`));
    if (usersSnap.exists()) {
      const users = usersSnap.val();
      const updates = {};
      for (const [uid, user] of Object.entries(users)) {
        if (!user.tenantId) {
          console.log(`Fixing user ${uid}`);
          updates[`users/${uid}/tenantId`] = 'default';
        }
      }
      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
        console.log("Updated", Object.keys(updates).length, "users.");
      } else {
        console.log("No users needed fixing.");
      }
    }
    process.exit(0);
  } catch (err) {
    console.error("Failed:", err);
    process.exit(1);
  }
}
fixTenants();
