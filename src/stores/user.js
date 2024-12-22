// stores/userStore.js
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null
  }),
  actions: {
    async fetchUser() {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser()
      if (error) {
        console.warn('No authenticated user found:', error.message)
        this.user = null
        return
      }
      this.user = user
    },
    initializeAuthListener() {
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
          this.user = session.user // Update user state when signed in
        } else if (event === 'SIGNED_OUT') {
          this.user = null // Clear user state when signed out
        }
      })
    },
    setUser(user) {
      this.user = user
    },
    clearUser() {
      this.user = null
    }
  },
  getters: {
    email: (state) => state.user?.email || null
  }
})
