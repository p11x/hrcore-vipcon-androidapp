import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, registrationSchema } from '../lib/validators'
import type { LoginFormData, RegistrationFormData } from '../lib/validators'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'

type Mode = 'login' | 'register'

export function Login() {
  const { signIn, registerAdmin, user, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')

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
      await registerAdmin(data.email, data.password, data.fullName, finalOrgName!)
      toast.success('Registration successful! Welcome.')
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error?.message || 'Failed to register organization')
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
                mode === 'register'
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
            ) : (
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
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
