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
        console.error('Error fetching user:', error.message)
        this.user = null
      } else {
        this.user = user
      }
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
