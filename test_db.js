import { mockDb } from './src/mock/mockDb.ts';
import { seedData } from './src/mock/seedData.ts';

const snap = await mockDb.get('users/admin-001');
console.log(snap.exists(), snap.val());
