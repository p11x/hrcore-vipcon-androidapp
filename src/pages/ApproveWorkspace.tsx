import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getDatabase } from '../firebase/config'

import { useAuth } from '../context/AuthContext'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export function ApproveWorkspace() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { registerAdmin, signOutUser } = useAuth()
  const processedRef = useRef(false)
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying registration request...')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid or missing verification token.')
      return
    }
    
    if (processedRef.current) return;
    processedRef.current = true;

const processApproval = async () => {
      try {
        const db = await getDatabase();
        const snapshot = await db.get('pending_registrations/' + token);
        
        if (!snapshot.exists()) {
          setStatus('error')
          setMessage('Verification link is expired or invalid.')
          return
        }
        
        const data = snapshot.val();
        setMessage('Creating admin account...')
        
        // Register the admin (this automatically logs them in due to Firebase Auth behavior)
        await registerAdmin(data.email, data.password, data.fullName, data.orgName)
        
        // Remove from pending registrations
        await db.remove('pending_registrations/' + token);
        
        // Sign out immediately so the company admin who clicked the link doesn't stay logged in as the new user
        await signOutUser()

        setStatus('success')
        setMessage('Admin workspace created successfully! The user can now log in.')
      } catch (error: any) {
        console.error('Approval error:', error)
        setStatus('error')
        if (error?.message?.includes('email-already-in-use')) {
          setMessage('An account with this email already exists.')
        } else {
          setMessage(error?.message || 'Failed to approve registration.')
        }
      }
    }

    processApproval()
  }, [token, registerAdmin, signOutUser])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-app">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-surface border border-border-soft rounded-2xl shadow-sm p-8 text-center"
      >
        <div className="flex justify-center mb-6">
          {status === 'loading' && <Loader2 className="w-16 h-16 text-primary animate-spin" />}
          {status === 'success' && <CheckCircle2 className="w-16 h-16 text-accent-mint" />}
          {status === 'error' && <XCircle className="w-16 h-16 text-accent-coral" />}
        </div>
        
        <h2 className="text-2xl font-display font-bold text-text-hi mb-2">
          {status === 'loading' ? 'Processing...' : status === 'success' ? 'Approved!' : 'Verification Failed'}
        </h2>
        
        <p className="text-text-mid mb-8">{message}</p>
        
        {status !== 'loading' && (
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all shadow-sm"
          >
            Return to Login
          </button>
        )}
      </motion.div>
    </div>
  )
}
