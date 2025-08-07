import { supabase } from '../lib/supabase'

class SessionManager {
  constructor() {
    this.refreshTimer = null
    this.setupSessionRefresh()
  }

  // Setup automatic session refresh
  setupSessionRefresh() {
    // Check session every 5 minutes
    setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // If session expires in less than 10 minutes, refresh it
          const expiresAt = new Date(session.expires_at * 1000)
          const now = new Date()
          const timeUntilExpiry = expiresAt.getTime() - now.getTime()
          const tenMinutes = 10 * 60 * 1000

          if (timeUntilExpiry < tenMinutes) {
            console.log('Refreshing session...')
            await supabase.auth.refreshSession()
          }
        }
      } catch (error) {
        console.error('Session refresh error:', error)
      }
    }, 5 * 60 * 1000) // Check every 5 minutes
  }

  // Get current session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Error getting current session:', error)
      return null
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const session = await this.getCurrentSession()
    return !!session && !!session.user
  }

  // Get user info
  async getUser() {
    const session = await this.getCurrentSession()
    return session?.user || null
  }

  // Refresh session manually
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      return data
    } catch (error) {
      console.error('Manual session refresh error:', error)
      throw error
    }
  }

  // Clear session data
  clearSession() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  }

  // Set up session persistence
  setupPersistence() {
    // Supabase automatically handles session persistence in localStorage
    // This method can be used for additional persistence setup if needed
    console.log('Session persistence setup complete')
  }
}

// Create singleton instance
const sessionManager = new SessionManager()

export default sessionManager
