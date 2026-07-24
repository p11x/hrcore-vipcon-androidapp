import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

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

async function checkUser() {
  try {
    const cred = await signInWithEmailAndPassword(auth, 'admin2@hrcore.dev', 'admin123');
    console.log("Signed in as admin. UID:", cred.user.uid);
    
    const usersSnap = await get(ref(db, `users`));
    if (usersSnap.exists()) {
      const users = usersSnap.val();
      for (const [uid, user] of Object.entries(users)) {
        if (user.email === 'itzteja66@gmail.com') {
          console.log("Found user:", uid);
          console.log(JSON.stringify(user, null, 2));
        }
      }
    } else {
      console.log("No users found");
    }
    process.exit(0);
  } catch (err) {
    console.error("Failed:", err);
    process.exit(1);
  }
}
checkUser();
