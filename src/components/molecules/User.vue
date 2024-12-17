<template>
  <div>
    <div class="user" v-if="userStore.user" @click="toggleDropdown">
      <span class="medium"> {{ formatUsername(userStore.user?.email) }} </span>
      <button v-if="isDropdownVisible" class="dropdown" @click="signOut">
        Logout
        <LucideLogOut class="icon" />
      </button>
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

    const formatUsername = (email) => {
      return email ? email.split('@')[0].slice(0, 2).toUpperCase() : '??'
    }

    function createAccount() {
      router.push({ name: 'Login' })
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
      formatUsername,
      createAccount
    }
  }
}
</script>

<style scoped>
.user {
  border: var(--border);
  border-radius: 50px;
  padding: 6px var(--xs-spacing);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background2);
  transition: var(--transition);
  position: relative;
  height: 30px;
  width: 30px;
}
.user:hover {
  cursor: pointer;
  filter: brightness(95%);
}

.user span {
  font-size: 0.75rem;
}

/* Style for the dropdown */
.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  border: var(--border);
  background-color: var(--background2);
  border-radius: var(--radius);
  z-index: 10;
}
</style>
