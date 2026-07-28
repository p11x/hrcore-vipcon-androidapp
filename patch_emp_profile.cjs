const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/EmployeeProfile.tsx', 'utf8');

// 1. Add Key icon
code = code.replace('X, Trash2 } from', 'X, Trash2, Key } from');

// 2. Add states
const statesToAdd = `  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<{type: 'idle'|'loading'|'success'|'error', msg: string}>({type: 'idle', msg: ''})
`;
code = code.replace('  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)', statesToAdd);

// 3. Add handle change password function
const funcToAdd = `
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      setPasswordStatus({ type: 'error', msg: 'Password must be at least 6 characters.' })
      return
    }
    setPasswordStatus({ type: 'loading', msg: 'Updating password...' })
    try {
      const response = await fetch('/api/admin/change-employee-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: employeeId, newPassword })
      })
      const data = await response.json()
      if (data.success) {
        setPasswordStatus({ type: 'success', msg: 'Password updated successfully!' })
        setTimeout(() => {
          setShowChangePassword(false)
          setNewPassword('')
          setPasswordStatus({ type: 'idle', msg: '' })
        }, 1500)
      } else {
        throw new Error(data.error || 'Failed to update password')
      }
    } catch (error: any) {
      setPasswordStatus({ type: 'error', msg: error.message })
    }
  }

  const handleDeleteEmployee = async () => {`;
code = code.replace('  const handleDeleteEmployee = async () => {', funcToAdd);

// 4. Add the button
const btnToAdd = `        <motion.div
          className="flex justify-end mt-4 gap-3"
          whileHover={{ y: -2 }}
        >
          <button
            onClick={() => setShowChangePassword(true)}
            className="px-4 py-2 bg-surface border border-border-soft text-text-hi rounded font-medium hover:bg-bg-app transition-colors flex items-center gap-2 focus-ring"
          >
            <Key className="w-4 h-4" />
            Change Password
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}`;
code = code.replace('        <motion.div\n          className="flex justify-end mt-4"\n          whileHover={{ y: -2 }}\n        >\n          <button\n            onClick={() => setShowDeleteConfirm(true)}', btnToAdd);

// 5. Add the modal
const modalToAdd = `      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface border border-border-soft rounded-xl p-6 w-full max-w-sm"
          >
            <h3 className="text-lg font-semibold text-text-hi mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Change Password
            </h3>
            <form onSubmit={handleChangePassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-mid mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-border-soft rounded-lg bg-bg-app text-sm focus-ring"
                  placeholder="Enter new password"
                  required
                />
              </div>
              
              {passwordStatus.msg && (
                <div className={\`p-3 mb-4 rounded-lg text-sm \${
                  passwordStatus.type === 'error' ? 'bg-accent-coral/10 text-accent-coral' :
                  passwordStatus.type === 'success' ? 'bg-accent-mint/10 text-accent-mint' :
                  'bg-bg-app text-text-mid'
                }\`}>
                  {passwordStatus.msg}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="flex-1 px-4 py-2 border border-border-soft rounded-lg text-text-hi hover:bg-bg-app transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordStatus.type === 'loading'}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {passwordStatus.type === 'loading' ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showDeleteConfirm && (`;
code = code.replace('      {showDeleteConfirm && (', modalToAdd);

fs.writeFileSync('src/pages/admin/EmployeeProfile.tsx', code);
