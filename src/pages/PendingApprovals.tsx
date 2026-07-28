import { useEffect, useState } from 'react'
import { getDatabase } from '../firebase/config'
import { ref, get, remove } from 'firebase/database'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle, Clock, RefreshCw, XCircle } from 'lucide-react'

export function PendingApprovals() {
const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      const db = await getDatabase();
      const snapshot = await get(ref(db, 'pending_registrations'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.entries(data).map(([token, regData]: any) => ({
          token,
          ...regData
        }));
        setRegistrations(list);
      } else {
        setRegistrations([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleDeny = async (token: string) => {
    if (!window.confirm("Are you sure you want to deny this registration?")) return;
    try {
      const db = await getDatabase();
      await remove(ref(db, 'pending_registrations/' + token));
      fetchRegistrations();
    } catch (e) {
      console.error(e);
      alert("Error denying registration");
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-app">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-surface border border-border-soft rounded-2xl shadow-sm p-8"
      >
                <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-text-hi">Pending Admin Registrations</h2>
          <button 
            onClick={fetchRegistrations}
            disabled={loading}
            className="p-2 text-text-mid hover:text-primary hover:bg-primary/10 rounded-lg transition-colors focus-ring disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
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
                                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDeny(reg.token)}
                    className="px-4 py-2.5 bg-surface border border-border-soft text-text-hi font-medium rounded-xl hover:bg-accent-coral/10 hover:text-accent-coral hover:border-accent-coral/20 transition-all focus-ring"
                    title="Deny"
                  >
                    Deny
                  </button>
                  <button
                    onClick={() => navigate(`/approve-workspace?token=${reg.token}`)}
                    className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all shadow-sm"
                  >
                    Verify & Approve
                  </button>
                </div>
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
