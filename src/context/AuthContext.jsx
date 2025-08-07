import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import sessionManager from '../utils/sessionManager'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Setup session persistence
        sessionManager.setupPersistence()
        
        // Get the current session
        const currentSession = await sessionManager.getCurrentSession()
        
        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          console.log('Session restored for user:', currentSession.user.email)
        } else {
          console.log('No existing session found')
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      setSession(session)
      setUser(session?.user ?? null)
      
      // Handle specific auth events
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user?.email)
        // Session is automatically persisted by Supabase
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        setUser(null)
        setSession(null)
        setIsAdmin(false)
        sessionManager.clearSession()
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed')
      }
    })

    return () => {
      subscription.unsubscribe()
      sessionManager.clearSession()
    }
  }, [])

  useEffect(() => {
    const fetchAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false)
        return
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        
        if (error) {
          console.error('Error fetching admin status:', error)
          setIsAdmin(false)
        } else {
          setIsAdmin(data?.is_admin === true)
        }
      } catch (error) {
        console.error('Error in fetchAdminStatus:', error)
        setIsAdmin(false)
      }
    }

    fetchAdminStatus()
  }, [user])

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) throw error
      
      // Session is automatically handled by onAuthStateChange and persisted
      console.log('User signed in successfully:', email)
      return data
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password 
      })
      
      if (error) throw error
      
      console.log('User signed up successfully:', email)
      return data
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const sendMagicLink = async (email) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      
      console.log('Magic link sent to:', email)
      return data
    } catch (error) {
      console.error('Magic link error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear local state
      setUser(null)
      setSession(null)
      setIsAdmin(false)
      sessionManager.clearSession()
      
      console.log('User signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const refreshSession = async () => {
    try {
      const data = await sessionManager.refreshSession()
      console.log('Session refreshed successfully')
      return data
    } catch (error) {
      console.error('Session refresh error:', error)
      throw error
    }
  }

  const getSession = () => {
    return session
  }

  const isAuthenticated = () => {
    return !!user && !!session
  }

  // Check if session is about to expire
  const isSessionExpiringSoon = () => {
    if (!session) return false
    
    const expiresAt = new Date(session.expires_at * 1000)
    const now = new Date()
    const timeUntilExpiry = expiresAt.getTime() - now.getTime()
    const fiveMinutes = 5 * 60 * 1000
    
    return timeUntilExpiry < fiveMinutes
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      session,
      signIn, 
      signUp, 
      sendMagicLink, 
      signOut, 
      isAdmin,
      refreshSession,
      getSession,
      isAuthenticated,
      isSessionExpiringSoon
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 