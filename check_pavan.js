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

async function checkPavan() {
  try {
    const cred = await signInWithEmailAndPassword(auth, 'admin2@hrcore.dev', 'admin123');
    
    const usersSnap = await get(ref(db, `users`));
    if (usersSnap.exists()) {
       for (const [uid, user] of Object.entries(usersSnap.val())) {
          if (user.email && user.email.includes('mamatha')) {
            console.log(`${uid}: ${user.email} (tenant: ${user.tenantId}, role: ${user.role})`);
          }
       }
    }
    
    // Now let's see tenants
    console.log("----");
    const tenant1 = await get(ref(db, `tenants/org-1784873898024/employees`));
    console.log("Employees in org-1784873898024:", tenant1.val());
    
    const tenant2 = await get(ref(db, `tenants/default/employees`));
    if (tenant2.exists()) {
      console.log("Number of employees in default:", Object.keys(tenant2.val()).length);
      for(const [k, v] of Object.entries(tenant2.val())) {
         if (v.name && v.name.toLowerCase().includes('pavan')) {
            console.log("Pavan in default:", v);
         }
      }
    }

    process.exit(0);
  } catch (err) {
    console.error("Failed:", err);
    process.exit(1);
  }
}
checkPavan();
