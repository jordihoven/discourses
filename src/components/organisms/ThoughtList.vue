<template>
  <main class="drafts">
    <div class="drafts-container">
      <!-- Loader -->
      <div v-if="loading" class="loading">
        <LucideLoader class="loader icon" />
      </div>
      <template v-else>
        <section v-if="notes.drafts.length > 0">
          <div class="drafts-grid">
            <div
              v-for="note in notes.drafts"
              :key="note.id"
              class="draft"
              :class="{ 'active-note': activeNoteId === note.id }"
              @click="openDraft(note.id)"
            >
              <div class="draft-content">
                <div v-for="(block, index) in note.content_json.blocks.slice(0, 3)" :key="index">
                  <p v-html="block.data?.text || 'No content'"></p>
                </div>
              </div>
              <div class="draft-footer">
                <span>{{ formatDate(note.updated_at) }}</span>
              </div>
            </div>
          </div>
        </section>
        <div v-else class="no-drafts">
          <span class="empty-state">You don't have any notes yet... 👀</span>
        </div>
        <!-- Shared Section -->
        <p v-if="notes.shared.length > 0" class="section-title">Shared</p>
        <section v-if="notes.shared.length > 0">
          <div class="drafts-grid">
            <div v-for="note in notes.shared" :key="note.id" class="draft">
              <div class="draft-content">
                <div v-for="(block, index) in note.content_json.blocks.slice(0, 3)" :key="index">
                  <p v-html="block.data?.text || 'No content'"></p>
                </div>
              </div>
              <button class="copy-button" @click="copySharedLink(note.id)"><LucideLink class="icon" />Copy link</button>
            </div>
          </div>
        </section>
        <div v-else class="no-drafts">
          <span v-if="notes.drafts.lenght > 0" class="empty-state">Shared notes will show here.. ✨</span>
        </div>
      </template>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { supabase } from '@/lib/supabaseClient'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { toast } from 'toaster-ts'
import { useClipboard } from '@vueuse/core'
const { copy } = useClipboard()

const activeNoteId = ref(null)

const emit = defineEmits(['openDraft'])
const props = defineProps({ refreshTrigger: Number })

const userStore = useUserStore()
const notes = ref({ drafts: [], shared: [] }) // To hold the fetched drafts and shared notes
const loading = ref(false)
const error = ref(null)

function formatDate(dateString) {
  const date = parseISO(dateString) // Parse the ISO string into a Date object
  return formatDistanceToNow(date, { addSuffix: true }) // Get the relative time, e.g., "2 days ago"
}

// Generate shareable link and copy it
const copySharedLink = (id) => {
  const link = `${window.location.origin}/note/${id}`
  copy(link)
    .then(() => {
      toast('Link copied to clipboard')
    })
    .catch(() => {
      toast.error('Failed to copy the link.')
    })
}

// Fetch drafts and shared notes from the database
const fetchNotes = async () => {
  if (!userStore.user?.id) {
    error.value = 'User not authenticated'
    return
  }

  loading.value = true
  error.value = null

  try {
    const { data: draftsData, error: fetchDraftsError } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userStore.user.id)
      .eq('status', 'draft')
      .order('updated_at', { ascending: false })

    const { data: sharedData, error: fetchSharedError } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userStore.user.id)
      .eq('status', 'sent')
      .order('updated_at', { ascending: false })

    if (fetchDraftsError || fetchSharedError) {
      throw new Error(fetchDraftsError?.message || fetchSharedError?.message)
    }

    notes.value = { drafts: draftsData, shared: sharedData }
  } catch (err) {
    error.value = err.message
    toast.error(err.message)
  } finally {
    loading.value = false
  }
}

const openDraft = (id) => {
  activeNoteId.value = id
  emit('openDraft', id)
}

// Call the fetchnotes method when the component is mounted
onMounted(() => {
  fetchNotes()
})

watch(
  () => props.refreshTrigger,
  () => {
    fetchNotes()
  }
)
</script>

<style scoped>
.drafts-container {
  padding: 0 var(--xs-spacing) var(--xs-spacing) var(--xs-spacing);
  max-width: 55em;
  margin: 0 auto;
  width: 100%;
}

.drafts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--sm-spacing);
}

.draft {
  background-color: var(--background);
  padding: var(--xs-spacing);
  border-radius: var(--radius);
  justify-content: space-between;
  display: flex;
  flex-direction: column;
  gap: var(--xs-spacing);
  transition: var(--transition);
  overflow: hidden;
}
.draft:hover,
.draft:active {
  cursor: pointer;
  filter: brightness(92%);
  transform: translateY(1px);
}

.draft.active-note {
  background-color: var(--stroke);
}
.draft.active-note .draft-footer::before {
  background: linear-gradient(transparent, var(--stroke));
}

.draft-content {
  overflow: hidden;
  max-height: 10em;
}

.draft-footer {
  position: relative;
  margin-top: 1em;
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
  background: linear-gradient(transparent, var(--background));
}

.drafts {
  display: flex;
  flex-direction: column;
  height: calc(100dvh - 46px);
  padding-bottom: env(safe-area-inset-bottom);
  overflow: auto;
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

.copy-button {
  background-color: var(--stroke);
  justify-content: center;
}

.empty-state {
  text-align: center;
  margin-bottom: var(--xs-spacing);
}
</style>
