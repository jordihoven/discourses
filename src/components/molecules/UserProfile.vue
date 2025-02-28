<template>
  <div>
    <div class="user" v-if="userStore.user" @click="showModal = true">
      <span class="medium"> {{ formatUsername(userStore.user?.email) }} </span>
    </div>
    <div class="signup" v-else>
      <button @click="createAccount">Sign up</button>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="user-tile">
            <p>{{ formatUsername(userStore.user?.email) }}</p>
            <p>{{ userStore.user?.email }}</p>
          </div>
          <button class="logout-button" @click="signOut">
            <LucideLogOut class="icon" />
            Logout
          </button>
          <!-- <button class="close-button" @click="closeModal">Close</button> -->
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import { toast } from 'toaster-ts'

const userStore = useUserStore()
const router = useRouter()

const showModal = ref(false)

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
    toast.success('Ciao for now 👋🏻')
    router.push({ name: 'Login' })
    showModal.value = false
  }
}

function closeModal() {
  showModal.value = false
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: start;
  justify-content: center;
  z-index: 1000;
  padding: var(--xs-spacing);
}

.modal-content {
  background: var(--background);
  padding: var(--xs-spacing);
  border: 1px solid var(--stroke);
  border-radius: var(--radius);
  width: 40em;

  margin-top: var(--m-spacing);

  display: flex;
  flex-direction: column;
  gap: var(--xs-spacing);
}

.logout-button {
  width: 100%;
}

.user-tile {
  background-color: var(--background2);
  padding: var(--xs-spacing);
  border: var(--border);
  border-radius: var(--radius);
}
</style>
