import './setup.js';
import { mockAuth } from './src/mock/mockAuth.ts';
import { getDatabase } from './src/firebase/config.ts';

mockAuth.onAuthStateChanged(async (u) => {
  console.log('auth state changed:', u?.uid);
  if (u) {
    try {
      const db = await getDatabase();
      let isAdminUser = false;
      let userTenantId = null;
      const token = await u.getIdTokenResult();
      console.log('claims', token.claims);
      isAdminUser = token.claims.role === 'admin';
      userTenantId = token.claims.tenantId || null;
      if (!isAdminUser || !userTenantId) {
        const snap = await db.get(`users/${u.uid}`);
        if (!snap.exists()) {
          console.log('does not exist');
          return;
        }
        const userData = snap.val();
        isAdminUser = userData.role === 'admin';
        userTenantId = userData.tenantId || null;
      }
      console.log('isAdmin', isAdminUser, 'tenantId', userTenantId);
    } catch(e) {
      console.error(e);
    }
  }
});

mockAuth.signInWithEmailAndPassword('admin@hrcore.dev', 'admin123').then(() => {
  console.log('signed in');
}).catch(console.error);
