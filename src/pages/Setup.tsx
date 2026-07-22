import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { StatusDot } from '../components/StatusDot'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { getAuth, getDatabase } from '../firebase/config'

export function Setup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [alreadySetup, setAlreadySetup] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkSetup = async () => {
      const database = await getDatabase()
      const snap = await (database as any).get('Config/setupComplete')
      if (snap.exists()) {
        setAlreadySetup(true)
        navigate('/login', { replace: true })
      }
    }
    checkSetup()
  }, [navigate])

  const handleSeed = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const auth = await getAuth()
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const db = await getDatabase()
      await db.set(`users/${cred.user.uid}`, {
        email,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        status: 'active',
        createdAt: new Date().toISOString()
      })
      await db.set('Config/setupComplete', true)
      setDone(true)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (alreadySetup) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-app p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="bg-surface border border-border-soft rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <StatusDot status="signal" size="lg" />
            <h1 className="text-2xl font-display font-semibold text-text-hi">
              Admin Setup
            </h1>
          </div>

          {done ? (
            <div>
              <p className="text-accent-mint mb-2">Admin account created successfully!</p>
              <p className="text-text-low text-sm">
                This route is now disabled. Access /login to continue.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSeed} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-mid mb-2">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-app border border-border-soft rounded text-text-hi focus:outline-none focus:border-primary transition-colors focus-ring"
                  placeholder="admin@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-mid mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-app border border-border-soft rounded text-text-hi focus:outline-none focus:border-primary transition-colors focus-ring"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-primary text-white font-medium rounded hover:bg-primary-dim transition-colors disabled:opacity-50 focus-ring"
              >
                {loading ? 'Creating...' : 'Create Admin'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}