const fs = require('fs');

// Patch Login.tsx
let login = fs.readFileSync('src/pages/Login.tsx', 'utf8');
login = login.replace(/import \{ ref, set \} from 'firebase\/database'/, '');
login = login.replace(/await set\(ref\(db, 'pending_registrations\/' \+ token\), registrationData\);/, "await db.set('pending_registrations/' + token, registrationData);");
fs.writeFileSync('src/pages/Login.tsx', login);

// Patch PendingApprovals.tsx
let pending = fs.readFileSync('src/pages/PendingApprovals.tsx', 'utf8');
pending = pending.replace(/import \{ ref, get, remove \} from 'firebase\/database'/, '');
pending = pending.replace(/const snapshot = await get\(ref\(db, 'pending_registrations'\)\);/, "const snapshot = await db.get('pending_registrations');");
pending = pending.replace(/await remove\(ref\(db, 'pending_registrations\/' \+ token\)\);/, "await db.remove('pending_registrations/' + token);");
fs.writeFileSync('src/pages/PendingApprovals.tsx', pending);

// Patch ApproveWorkspace.tsx
let approve = fs.readFileSync('src/pages/ApproveWorkspace.tsx', 'utf8');
approve = approve.replace(/import \{ ref, get, remove \} from 'firebase\/database'/, '');
approve = approve.replace(/const snapshot = await get\(ref\(db, 'pending_registrations\/' \+ token\)\);/, "const snapshot = await db.get('pending_registrations/' + token);");
approve = approve.replace(/await remove\(ref\(db, 'pending_registrations\/' \+ token\)\);/, "await db.remove('pending_registrations/' + token);");
fs.writeFileSync('src/pages/ApproveWorkspace.tsx', approve);

console.log("Patched all files");
