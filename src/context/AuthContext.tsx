import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth'
import { getAuth, getDatabase } from '../firebase/config'

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAdmin: boolean
  tenantId: string | null
  signIn: (email: string, password: string) => Promise<void>
  registerAdmin: (email: string, password: string, fullName: string, orgName: string) => Promise<void>
  signOutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [tenantId, setTenantId] = useState<string | null>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const initAuth = async () => {
      const auth = await getAuth()
      
      const handleAuthChange = async (firebaseUser: User | null) => {
        console.log('Auth state changed:', firebaseUser?.email || 'null')
        setLoading(true)
        setUser(firebaseUser)
        if (firebaseUser) {
          try {
            let isAdminUser = false
            let userTenantId = null
            const token = await firebaseUser.getIdTokenResult(true)
            console.log('Auth token claims:', JSON.stringify(token.claims))
            isAdminUser = token.claims.role === 'admin'
            userTenantId = (token.claims.tenantId as string) || null

            if (!isAdminUser || !userTenantId) {
              const db = await getDatabase()
              console.log('Fetching user doc from DB for:', firebaseUser.uid)

              let snap = null
              let retries = 0
              const maxRetries = 5

              while (retries < maxRetries) {
                snap = await db.get(`users/${firebaseUser.uid}`)
                if (snap.exists()) break

                console.log(`User doc not found, retry ${retries + 1}/${maxRetries}...`)
                await new Promise(resolve => setTimeout(resolve, 1500))
                retries++
              }

              if (!snap || !snap.exists()) {
                console.warn('User doc missing after retries. This might be a new user registration in progress.')
                // Don't sign out immediately if they just registered (they might have role/tenantId in local memory soon)
                // However, we need tenantId for the app to function.
                // We'll wait a bit longer or let them stay in a 'loading' state.
                setLoading(false)
                return
              }
              const userData = snap.val()
              console.log('User data from DB:', userData)
              isAdminUser = userData.role?.toLowerCase() === 'admin'
              userTenantId = userData.tenantId || null
            }
            
            console.log('Setting final auth state:', { isAdminUser, userTenantId })
            setIsAdmin(isAdminUser)
            setTenantId(userTenantId)
          } catch (e) {
            console.error('handleAuthChange error:', e)
            setIsAdmin(false)
            setTenantId(null)
          }
        } else {
          setIsAdmin(false)
          setTenantId(null)
        }
        setLoading(false)
      }

      if ((auth as any).onAuthStateChanged) {
        unsubscribe = (auth as any).onAuthStateChanged(handleAuthChange)
      } else {
        unsubscribe = onAuthStateChanged(auth, handleAuthChange)
      }
    }

    initAuth()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const auth = await getAuth()
    let cred: any
    if ((auth as any).signInWithEmailAndPassword) {
      const mockUser = await (auth as any).signInWithEmailAndPassword(email, password)
      cred = { user: mockUser }
    } else {
      cred = await signInWithEmailAndPassword(auth, email, password)
    }
    
    try {
      const token = await cred.user.getIdTokenResult(true)
      if (token.claims.role !== 'admin') {
        const db = await getDatabase()
        const snap = await db.get(`users/${cred.user.uid}`)
        if (!snap.exists()) {
          await signOut(auth)
          throw new Error('Your account has been disabled or deleted.')
        }
      }
    } catch (error: any) {
      throw error;
    }
  }

  const registerAdmin = async (email: string, password: string, fullName: string, orgName: string) => {
    const auth = await getAuth()
    const db = await getDatabase()

    let cred: any
    if ((auth as any).createUserWithEmailAndPassword) {
      cred = { user: await (auth as any).createUserWithEmailAndPassword(email, password, 'admin') }
    } else {
      cred = await createUserWithEmailAndPassword(auth, email, password)
    }

    const uid = cred.user.uid
    const newTenantId = `org-${Date.now()}`

    // 1. Create Organization
    await db.set(`organizations/${newTenantId}`, {
      name: orgName,
      createdAt: new Date().toISOString(),
      adminId: uid
    })

    // 2. Create User document (root level for auth lookup)
    await db.set(`users/${uid}`, {
      fullName,
      email,
      role: 'admin',
      tenantId: newTenantId,
      createdAt: new Date().toISOString(),
    })

    // 2b. Create User document (tenant scoped)
    await db.set(`tenants/${newTenantId}/users/${uid}`, {
      fullName,
      email,
      role: 'admin',
      tenantId: newTenantId,
      createdAt: new Date().toISOString(),
    })

    // 3. Create Admin record in employees for profile
    await db.set(`tenants/${newTenantId}/employees/${uid}`, {
      name: fullName,
      email,
      role: 'admin',
      tenantId: newTenantId,
      companyName: orgName,
      status: 'Active'
    })
  }

  const signOutUser = async () => {
    try {
      const auth = await getAuth()
      if ((auth as any).signOut) {
        await (auth as any).signOut()
      } else {
        await signOut(auth)
      }
    } catch (e) {
      console.error('Sign out error:', e)
    } finally {
      setIsAdmin(false)
      setTenantId(null)
      setUser(null)
      sessionStorage.clear()
      localStorage.clear()
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, tenantId, signIn, registerAdmin, signOutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}