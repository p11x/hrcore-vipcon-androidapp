import { useState, useEffect } from 'react'
import { PageShell } from '../../components/PageShell'
import { useAuth } from '../../context/AuthContext'
import { getDatabase, getAuth } from '../../firebase/config'
import { User, Lock, Mail, Building, Key } from 'lucide-react'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'

export function AdminProfile() {
  const { user, tenantId } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Password reset state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<{type: 'idle'|'loading'|'success'|'error', msg: string}>({type: 'idle', msg: ''})

  useEffect(() => {
    if (!user || !tenantId) return
    const fetchProfile = async () => {
      const db = await getDatabase()
      const snap = await db.get(`tenants/${tenantId}/employees/${user.uid}`)
      if (snap.exists()) {
        setProfile(snap.val())
      }
      setLoading(false)
    }
    fetchProfile()
  }, [user, tenantId])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', msg: 'Passwords do not match.' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', msg: 'Password must be at least 6 characters.' })
      return
    }
    
    setPasswordStatus({ type: 'loading', msg: 'Updating password...' })
    try {
      const auth = await getAuth()
      if (auth.currentUser && user?.email) {
        const credential = EmailAuthProvider.credential(user.email, oldPassword)
        await reauthenticateWithCredential(auth.currentUser, credential)
        await updatePassword(auth.currentUser, newPassword)
        setPasswordStatus({ type: 'success', msg: 'Password updated successfully!' })
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordStatus({ type: 'error', msg: 'User not logged in.' })
      }
    } catch (error: any) {
      console.error("Password update error:", error)
      setPasswordStatus({ type: 'error', msg: error.message || 'Failed to update password. You may need to log in again.' })
    }
  }

  if (loading) {
    return (
      <PageShell title="Admin Profile">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Admin Profile">
      <div className="max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Details */}
        <div className="bg-surface border border-border-soft rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-display font-semibold text-text-hi mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Account Details
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs font-medium text-text-low uppercase tracking-wider mb-1 block">Full Name</label>
              <div className="flex items-center gap-3 text-text-hi">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-5 h-5" />
                </div>
                <span className="font-medium text-lg">{profile?.name || user?.displayName || 'Admin User'}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-low uppercase tracking-wider mb-1 block">Email Address</label>
              <div className="flex items-center gap-3 text-text-hi">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="font-medium">{profile?.email || user?.email}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-low uppercase tracking-wider mb-1 block">Company</label>
              <div className="flex items-center gap-3 text-text-hi">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Building className="w-5 h-5" />
                </div>
                <span className="font-medium">{profile?.companyName || 'Not Set'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-surface border border-border-soft rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-display font-semibold text-text-hi mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Security
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">Old Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-low" />
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border-soft rounded-xl bg-bg-app text-sm focus-ring"
                  placeholder="Enter old password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">New Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-low" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border-soft rounded-xl bg-bg-app text-sm focus-ring"
                  placeholder="Enter new password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">Confirm New Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-low" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border-soft rounded-xl bg-bg-app text-sm focus-ring"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            {passwordStatus.msg && (
              <div className={`p-3 rounded-lg text-sm ${
                passwordStatus.type === 'error' ? 'bg-accent-coral/10 text-accent-coral' :
                passwordStatus.type === 'success' ? 'bg-accent-mint/10 text-accent-mint' :
                'bg-bg-app text-text-mid'
              }`}>
                {passwordStatus.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={passwordStatus.type === 'loading'}
              className="w-full py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {passwordStatus.type === 'loading' ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  )
}
