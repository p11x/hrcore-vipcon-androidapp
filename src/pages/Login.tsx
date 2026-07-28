import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, registrationSchema } from '../lib/validators'
import type { LoginFormData, RegistrationFormData } from '../lib/validators'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Mail } from 'lucide-react'

type Mode = 'login' | 'register' | 'verify'

export function Login() {
  const { signIn, registerAdmin, user, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [pendingRegData, setPendingRegData] = useState<RegistrationFormData | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors, isSubmitting: isLoggingIn },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const {
    register: registerReg,
    handleSubmit: handleSubmitReg,
    watch: watchReg,
    formState: { errors: regErrors, isSubmitting: isRegistering },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { companySelection: 'Vepcon Soft Systems' }
  })

  const passwordValue = watchReg('password') || ''

  const passwordRules = [
    { label: '8+ chars', met: passwordValue.length >= 8 },
    { label: 'Mixed case', met: /[A-Z]/.test(passwordValue) && /[a-z]/.test(passwordValue) },
    { label: 'Number', met: /[0-9]/.test(passwordValue) },
    { label: 'Special char', met: /[^A-Za-z0-9]/.test(passwordValue) }
  ]
  const isPasswordDirty = passwordValue.length > 0

  useEffect(() => {
    if (user && !loading) {
      console.log('Login useEffect: user is logged in, isAdmin:', isAdmin)
      if (isAdmin) {
        console.log('Navigating to admin dashboard')
        navigate('/admin/dashboard', { replace: true })
      } else {
        console.log('Navigating to employee dashboard')
        navigate('/employee/dashboard', { replace: true })
      }
    }
  }, [user, isAdmin, navigate, loading])

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password)
      toast.success('Welcome back')
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error?.message || 'Invalid credentials')
    }
  }

  const onRegisterSubmit = async (data: RegistrationFormData) => {
    try {
      const finalOrgName = data.companySelection === 'Others' ? data.customCompanyName : data.companySelection
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      const registrationData = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        orgName: finalOrgName,
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/send-approval-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          companyEmail: 'hrcore001@gmail.com', // Fixed to company email
          registrantName: data.fullName,
          registrationData,
          clientOrigin: window.location.origin.replace('ais-dev-', 'ais-pre-')
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send verification email')
      }

      setMode('verify')
      toast.success('Verification email sent to company admin.')
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error?.message || 'Failed to initiate registration')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-app">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface border border-border-soft rounded-2xl shadow-sm p-8">
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.svg" alt="Logo" className="w-16 h-16 rounded-xl object-cover mb-4 shadow-lg shadow-primary/20" />
            <h1 className="text-3xl font-display font-bold text-text-hi">
              HR CORE
            </h1>
            <p className="text-sm text-text-mid mt-1 font-medium">Multi-Tenant Workforce Management</p>
          </div>

          <div className="flex p-1 bg-bg-app rounded-lg mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-mid hover:text-text-hi'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                (mode === 'register' || mode === 'verify')
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-mid hover:text-text-hi'
              }`}
            >
              Register
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSubmitLogin(onLoginSubmit)}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold text-text-low uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    {...registerLogin('email')}
                    type="email"
                    className="w-full px-4 py-2.5 bg-bg-app border border-border-soft rounded-xl text-text-hi focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="you@company.com"
                    disabled={isLoggingIn}
                  />
                  {loginErrors.email && (
                    <p className="text-accent-coral text-xs mt-1.5 ml-1">{loginErrors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-low uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input
                    {...registerLogin('password')}
                    type="password"
                    className="w-full px-4 py-2.5 bg-bg-app border border-border-soft rounded-xl text-text-hi focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="••••••••"
                    disabled={isLoggingIn}
                  />
                  {loginErrors.password && (
                    <p className="text-accent-coral text-xs mt-1.5 ml-1">{loginErrors.password.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/25 active:scale-[0.98]"
                >
                  {isLoggingIn ? 'Verifying...' : 'Sign In'}
                </button>
              </motion.form>
            ) : mode === 'register' ? (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleSubmitReg(onRegisterSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-low uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      {...registerReg('fullName')}
                      className="w-full px-4 py-2.5 bg-bg-app border border-border-soft rounded-xl text-text-hi outline-none focus:border-primary transition-all"
                      placeholder="Enter your full name"
                      disabled={isRegistering}
                    />
                    {regErrors.fullName && (
                      <p className="text-accent-coral text-xs mt-1">{regErrors.fullName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-low uppercase tracking-wider mb-2">
                      Company
                    </label>
                    <select
                      {...registerReg('companySelection')}
                      className="w-full px-4 py-2.5 bg-bg-app border border-border-soft rounded-xl text-text-hi outline-none focus:border-primary transition-all"
                      disabled={isRegistering}
                    >
                      <option value="Vepcon Soft Systems">Vepcon Soft Systems</option>
                      <option value="Others">Others</option>
                    </select>
                    {regErrors.companySelection && (
                      <p className="text-accent-coral text-xs mt-1">{regErrors.companySelection.message}</p>
                    )}

                    {watchReg('companySelection') === 'Others' && (
                      <input
                        {...registerReg('customCompanyName')}
                        className="w-full px-4 py-2.5 bg-bg-app border border-border-soft rounded-xl text-text-hi outline-none focus:border-primary transition-all mt-2"
                        placeholder="Type your company name"
                        disabled={isRegistering}
                      />
                    )}
                    {regErrors.customCompanyName && (
                      <p className="text-accent-coral text-xs mt-1">{regErrors.customCompanyName.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-low uppercase tracking-wider mb-2">
                    Work Email
                  </label>
                  <input
                    {...registerReg('email')}
                    type="email"
                    className="w-full px-4 py-2.5 bg-bg-app border border-border-soft rounded-xl text-text-hi outline-none focus:border-primary transition-all"
                    placeholder="admin@company.com"
                    disabled={isRegistering}
                  />
                  {regErrors.email && (
                    <p className="text-accent-coral text-xs mt-1">{regErrors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-low uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input
                    {...registerReg('password')}
                    type="password"
                    className="w-full px-4 py-2.5 bg-bg-app border border-border-soft rounded-xl text-text-hi outline-none focus:border-primary transition-all"
                    placeholder="Min 8 characters, mixed case"
                    disabled={isRegistering}
                  />
                  {isPasswordDirty && (
                    <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
                      {passwordRules.map((rule, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-[10px]">
                          {rule.met ? (
                            <Check className="w-3 h-3 text-accent-mint" />
                          ) : (
                            <X className="w-3 h-3 text-text-low" />
                          )}
                          <span className={rule.met ? 'text-accent-mint font-bold' : 'text-text-low'}>
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {regErrors.password && (
                    <p className="text-accent-coral text-xs mt-1">{regErrors.password.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/25 active:scale-[0.98] mt-2"
                >
                  {isRegistering ? 'Creating Workspace...' : 'Create Admin Account'}
                </button>
                <p className="text-[11px] text-text-low text-center mt-4">
                  By registering, you agree to our Terms of Service and Privacy Policy.
                </p>
              </motion.form>
            ) : mode === 'verify' ? (
              <motion.div
                key="verify"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center text-center space-y-6"
              >
                <div className="w-16 h-16 bg-accent-mint/10 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-accent-mint" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-text-hi mb-2">Wait for Approval</h3>
                  <p className="text-sm text-text-mid">
                    We've sent an approval email to the company.
                  </p>
                </div>
                
                <div className="w-full p-4 border border-border-soft bg-bg-app rounded-xl text-center">
                  <p className="text-xs text-text-low uppercase font-bold tracking-wider mb-3">Pending Verification</p>
                  <p className="text-sm text-text-mid mb-4">
                    An email was sent. Once the company admin approves, you can log in with your credentials.
                  </p>
                </div>
                
                <button
                  onClick={() => setMode('register')}
                  className="text-sm text-text-low hover:text-text-hi transition-colors"
                >
                  Done
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
