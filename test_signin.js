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

async function test() {
  try {
    const cred = await signInWithEmailAndPassword(auth, 'admin@hrcore.dev', 'admin123');
    console.log("Signed in with uid:", cred.user.uid);
    const snap = await get(ref(db, `users/${cred.user.uid}`));
    console.log("DB snap exists:", snap.exists());
    if (snap.exists()) {
      console.log("DB data:", snap.val());
    }
    process.exit(0);
  } catch (err) {
    console.error("Sign in failed:", err.message);
    process.exit(1);
  }
}

test();
