import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle, Clock } from 'lucide-react'

export function PendingApprovals() {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/get-all-pending-registrations')
      .then(res => res.json())
      .then(data => {
        setRegistrations(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-app">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-surface border border-border-soft rounded-2xl shadow-sm p-8"
      >
        <h2 className="text-2xl font-display font-bold text-text-hi mb-6">Pending Admin Registrations</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-text-low mx-auto mb-4" />
            <p className="text-text-mid">No pending registrations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map(reg => (
              <div key={reg.token} className="p-4 border border-border-soft rounded-xl bg-bg-app flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-text-hi">{reg.fullName}</h3>
                  <p className="text-sm text-text-mid">{reg.email}</p>
                  <p className="text-sm text-text-low mt-1">
                    <span className="font-medium text-text-mid">Organization:</span> {reg.orgName}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-text-low">
                    <Clock className="w-3 h-3" />
                    Requested on: {new Date(reg.createdAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/approve-workspace?token=${reg.token}`)}
                  className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all shadow-sm shrink-0"
                >
                  Verify & Approve
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-border-soft text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-text-mid hover:text-primary transition-colors text-sm font-medium"
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  )
}
