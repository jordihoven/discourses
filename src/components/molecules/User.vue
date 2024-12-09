<template>
  <div>
    <div class="user" v-if="userStore.user" @click="toggleDropdown">
      <span class="medium"> {{ getUsername(userStore.user?.email) }} </span>
      <div v-if="isDropdownVisible" class="dropdown">
        <button @click="signOut">
          Logout
          <LucideLogOut class="icon" />
        </button>
      </div>
    </div>
    <div class="signup" v-else>
      <button @click="createAccount">Create account</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'

import { toast } from 'toaster-ts'

export default {
  name: 'UserComponent',
  setup() {
    const userStore = useUserStore()
    const router = useRouter()

    const isDropdownVisible = ref(false)
    function toggleDropdown() {
      isDropdownVisible.value = !isDropdownVisible.value
    }

    function createAccount() {
      router.push({ name: 'Login' })
    }

    function getUsername(email) {
      return email ? email.split('@')[0] : ''
    }

    async function signOut() {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error.message)
      } else {
        toast.success('Logged out 👋🏻')
        router.push({ name: 'Login' })
      }
    }

    return {
      userStore,
      signOut,
      isDropdownVisible,
      toggleDropdown,
      getUsername,
      createAccount
    }
  }
}
</script>

<style scoped>
.user {
  border: var(--border);
  border-radius: var(--radius);
  padding: 6px var(--xs-spacing);
  display: flex;
  gap: var(--xs-spacing);
  align-items: center;
  background-color: var(--background2);
  transition: var(--transition);
  position: relative;
}
.user:hover {
  cursor: pointer;
  filter: brightness(95%);
}

/* Style for the dropdown */
.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  border: var(--border);
  background-color: var(--background2);
  border-radius: var(--radius);
  padding: 2px;
  z-index: 10;
  width: 100%;
}
.dropdown button {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
</style>
