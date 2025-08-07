import { supabase } from '../lib/supabase'

class SessionManager {
  constructor() {
    this.refreshTimer = null
    this.isRefreshing = false
    this.setupSessionRefresh()
  }

  // Setup automatic session refresh
  setupSessionRefresh() {
    // Check session every 5 minutes
    this.refreshTimer = setInterval(async () => {
      await this.checkAndRefreshSession()
    }, 5 * 60 * 1000) // Check every 5 minutes
  }

  // Check and refresh session if needed
  async checkAndRefreshSession() {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing) {
      return
    }

    try {
      this.isRefreshing = true
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        return
      }
      
      if (!session) {
        console.log('No active session found')
        return
      }

      // Check if session is valid and not expired
      if (!session.access_token || !session.refresh_token) {
        console.log('Session missing tokens')
        return
      }

      // If session expires in less than 10 minutes, refresh it
      const expiresAt = new Date(session.expires_at * 1000)
      const now = new Date()
      const timeUntilExpiry = expiresAt.getTime() - now.getTime()
      const tenMinutes = 10 * 60 * 1000

      if (timeUntilExpiry < tenMinutes && timeUntilExpiry > 0) {
        console.log('Refreshing session...')
        await this.refreshSession()
      } else if (timeUntilExpiry <= 0) {
        console.log('Session has expired')
        // Session is expired, clear it
        await supabase.auth.signOut()
      }
    } catch (error) {
      console.error('Session refresh error:', error)
      
      // If refresh token is invalid, sign out the user
      if (error.message?.includes('Invalid Refresh Token') || 
          error.message?.includes('Refresh Token Not Found')) {
        console.log('Invalid refresh token, signing out user')
        try {
          await supabase.auth.signOut()
        } catch (signOutError) {
          console.error('Error signing out:', signOutError)
        }
      }
    } finally {
      this.isRefreshing = false
    }
  }

  // Get current session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting current session:', error)
        return null
      }
      return session
    } catch (error) {
      console.error('Error getting current session:', error)
      return null
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const session = await this.getCurrentSession()
      return !!session && !!session.user && !!session.access_token
    } catch (error) {
      console.error('Error checking authentication:', error)
      return false
    }
  }

  // Get user info
  async getUser() {
    try {
      const session = await this.getCurrentSession()
      return session?.user || null
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  }

  // Refresh session manually
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Manual session refresh error:', error)
        
        // If refresh token is invalid, sign out the user
        if (error.message?.includes('Invalid Refresh Token') || 
            error.message?.includes('Refresh Token Not Found')) {
          console.log('Invalid refresh token during manual refresh, signing out user')
          await supabase.auth.signOut()
        }
        
        throw error
      }
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
      this.refreshTimer = null
    }
    this.isRefreshing = false
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
