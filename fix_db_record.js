import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

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

async function fix() {
  try {
    const cred = await signInWithEmailAndPassword(auth, 'admin@hrcore.dev', 'admin123');
    const uid = cred.user.uid;
    const tenantId = 'mock-tenant-1';

    await set(ref(db, `organizations/${tenantId}`), {
      name: 'Acme Corp',
      createdAt: new Date().toISOString(),
      adminId: uid
    });

    await set(ref(db, `users/${uid}`), {
      fullName: 'Admin User',
      email: 'admin@hrcore.dev',
      role: 'admin',
      tenantId: tenantId,
      createdAt: new Date().toISOString(),
    });

    await set(ref(db, `employees/${uid}`), {
      name: 'Admin User',
      email: 'admin@hrcore.dev',
      role: 'Admin',
      tenantId: tenantId,
      companyName: 'Acme Corp',
      status: 'Active'
    });

    console.log("DB records fixed!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
