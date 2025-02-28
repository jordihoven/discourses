<template>
  <div class="drafts">
    <PageHeader></PageHeader>
    <main>
      <div class="drafts-container">
        <!-- Loader -->
        <div v-if="loading" class="loading">
          <LucideLoader class="loader icon" />
        </div>
        <!-- Drafts Section -->
        <template v-else>
          <p class="section-title">Drafts</p>
          <section v-if="letters.drafts.length > 0">
            <div class="drafts-grid">
              <div v-for="letter in letters.drafts" :key="letter.id" class="draft" @click="openDraft(letter.id)">
                <div class="draft-content">
                  <div v-for="(block, index) in letter.content_json.blocks.slice(0, 3)" :key="index">
                    <p v-html="block.data?.text || 'No content'"></p>
                  </div>
                </div>
                <div class="draft-footer">
                  <span>{{ formatDate(letter.updated_at) }}</span>
                </div>
              </div>
            </div>
          </section>
          <div v-else class="no-drafts">
            <span>You don't have any drafts yet... 👀</span>
          </div>
          <!-- Shared Section -->
          <p class="section-title">Shared</p>
          <section v-if="letters.shared.length > 0">
            <div class="drafts-grid">
              <div v-for="letter in letters.shared" :key="letter.id" class="draft">
                <div class="draft-content">
                  <div v-for="(block, index) in letter.content_json.blocks.slice(0, 3)" :key="index">
                    <p v-html="block.data?.text || 'No content'"></p>
                  </div>
                </div>
                <button class="copy-button" @click="copySharedLink(letter.id)"><LucideLink class="icon" />Copy link</button>
              </div>
            </div>
          </section>
          <div v-else class="no-drafts">
            <span>Shared letters will show up here.. ✨</span>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { supabase } from '@/lib/supabaseClient'
import PageHeader from '@/components/organisms/PageHeader.vue'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { useRouter } from 'vue-router'
import { toast } from 'toaster-ts'
import { useClipboard } from '@vueuse/core'
const { copy } = useClipboard()

const userStore = useUserStore()
const letters = ref({ drafts: [], shared: [] }) // To hold the fetched drafts and shared letters
const loading = ref(false)
const error = ref(null)
const router = useRouter()

function formatDate(dateString) {
  const date = parseISO(dateString) // Parse the ISO string into a Date object
  return formatDistanceToNow(date, { addSuffix: true }) // Get the relative time, e.g., "2 days ago"
}

// Generate shareable link and copy it
const copySharedLink = (id) => {
  const link = `${window.location.origin}/letter/${id}`
  copy(link)
    .then(() => {
      toast('Link copied to clipboard')
    })
    .catch(() => {
      toast.error('Failed to copy the link.')
    })
}

// Fetch drafts and shared letters from the database
const fetchLetters = async () => {
  if (!userStore.user?.id) {
    error.value = 'User not authenticated'
    return
  }

  loading.value = true
  error.value = null

  try {
    const { data: draftsData, error: fetchDraftsError } = await supabase
      .from('letters')
      .select('*')
      .eq('user_id', userStore.user.id)
      .eq('status', 'draft')
      .order('updated_at', { ascending: false })

    const { data: sharedData, error: fetchSharedError } = await supabase
      .from('letters')
      .select('*')
      .eq('user_id', userStore.user.id)
      .eq('status', 'sent')
      .order('updated_at', { ascending: false })

    if (fetchDraftsError || fetchSharedError) {
      throw new Error(fetchDraftsError?.message || fetchSharedError?.message)
    }

    letters.value = { drafts: draftsData, shared: sharedData }
  } catch (err) {
    error.value = err.message
    toast.error(err.message)
  } finally {
    loading.value = false
  }
}

const openDraft = (id) => {
  router.push({ name: 'LetterComposer', query: { draftId: id } })
}

// Call the fetchLetters method when the component is mounted
onMounted(() => {
  fetchLetters()
})
</script>

<style scoped>
.drafts-container {
  padding: var(--l-spacing) var(--xs-spacing);
  max-width: 55em;
  margin: 0 auto;
  width: 100%;
}

.drafts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: var(--sm-spacing);
}

.draft {
  background-color: var(--background2);
  padding: var(--xs-spacing);
  border-radius: var(--radius);
  border: var(--border);
  justify-content: space-between;
  display: flex;
  flex-direction: column;
  gap: var(--xs-spacing);
  transition: var(--transition);
  box-shadow: 0 2px 6px var(--background2);
  overflow: hidden;
}
.draft:hover,
.draft:active {
  cursor: pointer;
  filter: brightness(92%);
  transform: translateY(1px);
}

.draft-content {
  height: 10em;
  overflow: hidden;
}

.draft-footer {
  position: relative;
}

.draft-footer::before {
  content: '';
  position: absolute;
  /* hacky spacing to start the ::before on top of footer, could cause issues */
  bottom: var(--s-spacing);
  left: 0;
  width: 100%;
  height: 5em;
  pointer-events: none;
  background: linear-gradient(transparent, var(--background2));
}

.drafts {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.loading {
  display: flex;
  justify-content: center;
}

.loader {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.no-drafts {
  display: flex;
  justify-content: center;
}

.section-title {
  margin-bottom: var(--xs-spacing);
  font-weight: var(--medium);
}

p.section-title {
  color: var(--text2);
}

section {
  margin-bottom: var(--l-spacing);
}

.copy-button {
  background-color: var(--stroke);
  justify-content: center;
}
</style>
