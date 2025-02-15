<template>
  <div class="lettercomposer">
    <!-- Always visible trigger button -->
    <div class="composer-trigger">
      <button class="trigger-button" @click="openComposer">What's on your mind?</button>
    </div>

    <!-- Expanded composer view (overlay) -->
    <div v-if="showComposer" class="composer-wrapper">
      <header class="composer-header">
        <button class="close-button" @click="closeComposer">×</button>
      </header>
      <main class="composer-container">
        <div ref="editor" class="editorjs" :class="{ disabled: generatedLink }"></div>
      </main>
      <!-- Modal to show generated link and copy option -->
      <transition name="fade">
        <div v-if="showModal" ref="modal" class="modal">
          <div class="modal-content">
            <span>Share your letter to anyone, anywhere.</span>
            <div v-if="!generatedLink" class="copy-letter">
              <a class="letter-link disabled" href="#"> discourses.app/letter/... </a>
              <button @click="generateLetterLink" :disabled="isGenerating">
                <LucideLink class="icon" />
                {{ isGenerating ? 'Generating...' : 'Create Link' }}
              </button>
            </div>
            <div v-else class="copy-letter">
              <a class="letter-link" :href="generatedLink" target="_blank">
                {{ generatedLink }}
              </a>
              <button @click="copyLink">
                <LucideCopy class="icon" />
                Copy link
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'toaster-ts'
import { useClipboard, onClickOutside } from '@vueuse/core'
import { useUserStore } from '@/stores/user'

import { useRouter } from 'vue-router'
const router = useRouter()

const showComposer = ref(false)
const openComposer = () => {
  showComposer.value = true
}
const closeComposer = () => {
  showComposer.value = false
  router.replace({ query: {} }) // Clears the URL parameters
}

const editor = ref(null)
let editorInstance = null
const editorContent = ref(null)
const showModal = ref(false)
const generatedLink = ref(null)
const isGenerating = ref(false)
const { copy } = useClipboard()
const modal = ref(null)
const saving = ref(false)
const userStore = useUserStore()

const route = useRoute()

function debounce(func, wait) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
const debouncedSaveDraft = debounce(saveDraft, 1200)

// --- Function to load a draft by ID ---
async function fetchDraft(draftId) {
  try {
    const { data, error } = await supabase.from('letters').select('content_json').eq('id', draftId).single()
    if (error) throw error
    if (data) {
      editorContent.value = data.content_json
      // If the editor is ready, render the content
      if (editorInstance) {
        editorInstance.render(editorContent.value)
      }
    }
  } catch (err) {
    toast.error('Failed to load draft: ' + err.message)
  }
}

// --- EditorJS functions ---
async function saveDraft(content) {
  if (saving.value) return
  saving.value = true

  try {
    const userId = userStore.user?.id
    if (!userId) throw new Error('User not authenticated or user ID missing')

    if (!content || content.blocks.length === 0) {
      if (route.query.draftId) {
        await deleteDraft(route.query.draftId)
      }
      return
    }

    if (!route.query.draftId) {
      // Insert new draft if no draftId exists
      const { data, error } = await supabase
        .from('letters')
        .insert([{ content_json: content, user_id: userId, status: 'draft' }])
        .select()
      if (error) throw error
      // Here, you could update the URL with the new draft id if desired.
    } else {
      // Update existing draft
      const { error } = await supabase.from('letters').update({ content_json: content, status: 'draft' }).eq('id', route.query.draftId)
      if (error) throw error
    }
    toast.success('Draft saved')
  } catch (err) {
    console.error('Error saving draft:', err.message)
    toast.error('Failed to save draft')
  } finally {
    saving.value = false
  }
}

async function deleteDraft(id) {
  try {
    const { error } = await supabase.from('letters').delete().eq('id', id)
    if (error) throw error
    toast.success('Draft deleted')
  } catch (err) {
    console.error('Error deleting draft:', err.message)
    toast.error('Failed to delete draft')
  }
}

async function generateLetterLink() {
  if (!editorInstance) return
  try {
    isGenerating.value = true
    const content = await editorInstance.save()

    if (route.query.draftId) {
      const { error } = await supabase.from('letters').update({ content_json: content, status: 'sent' }).eq('id', route.query.draftId)
      if (error) throw error

      generatedLink.value = `${window.location.origin}/letter/${route.query.draftId}`
      toast.success('Link generated successfully! 🎉')
      showModal.value = true
    } else {
      const { data, error } = await supabase
        .from('letters')
        .insert([{ content_json: content, status: 'sent' }])
        .select()
      if (error) throw error

      const letterId = data[0].id
      generatedLink.value = `${window.location.origin}/letter/${letterId}`
      toast.success('Link generated successfully! 🎉')
      showModal.value = true
    }
  } catch (err) {
    console.error('Error generating link: ', err.message)
    toast.error('Something went wrong 🙊 ' + err.message)
  } finally {
    isGenerating.value = false
  }
}

function copyLink() {
  if (generatedLink.value) {
    copy(generatedLink.value)
    toast.success('Copied to clipboard! 🔗')
  }
}

// --- Click-outside to close modal ---
onClickOutside(modal, () => {
  showModal.value = false
})

// --- Watch for composer visibility to initialize/destroy EditorJS ---
watch(showComposer, (val) => {
  if (val) {
    // When the composer becomes visible, initialize EditorJS
    nextTick(() => {
      if (!editorInstance) {
        editorInstance = new EditorJS({
          holder: editor.value,
          tools: { header: Header },
          autofocus: true,
          placeholder: "What's on your mind?...",
          inlineToolbar: ['bold', 'italic'],
          onChange: async () => {
            const content = await editorInstance.save()
            editorContent.value = content.blocks.length > 0 ? content : null
            await debouncedSaveDraft(content)
          }
        })

        // (Optional) Add EditorJS event listeners here...
        editor.value.addEventListener('click', (event) => {
          const activeBlock = event.target.closest('.ce-block')
          if (activeBlock) {
            const blockId = activeBlock.getAttribute('data-id')
            if (blockId) {
              const blockIndex = editorInstance.blocks.getBlockIndex(blockId)
              updateBlockOpacity(blockIndex)
            }
          }
        })
        editor.value.addEventListener('keyup', () => {
          setTimeout(updateActiveBlockBySelection, 10)
        })

        // If the route has a draftId, load that draft into EditorJS
        if (route.query.draftId) {
          fetchDraft(route.query.draftId)
        }
      }
    })
  } else {
    if (editorInstance) {
      editorInstance.destroy()
      editorInstance = null
    }
  }
})

// --- Watch for changes in route query to open a draft ---
watch(
  () => route.query.draftId,
  (newDraftId) => {
    if (newDraftId) {
      openComposer()
      // If EditorJS is already initialized, load the draft;
      // otherwise, fetchDraft will be called in the showComposer watcher.
      if (editorInstance) {
        fetchDraft(newDraftId)
      }
    }
  }
)

function updateBlockOpacity(activeBlockIndex) {
  const blocks = editor.value.querySelectorAll('.ce-block')
  blocks.forEach((block, index) => {
    block.style.opacity = index === activeBlockIndex ? '1' : '0.5'
  })
}

function updateActiveBlockBySelection() {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  const range = selection.getRangeAt(0)
  const focusedNode = range.startContainer
  const activeBlock =
    focusedNode.nodeType === Node.ELEMENT_NODE ? focusedNode.closest('.ce-block') : focusedNode.parentElement.closest('.ce-block')
  if (activeBlock) {
    const blockId = activeBlock.getAttribute('data-id')
    if (blockId) {
      const blockIndex = editorInstance.blocks.getBlockIndex(blockId)
      updateBlockOpacity(blockIndex)
      activeBlock.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }
}

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.destroy()
  }
})
</script>

<style scoped>
/* Container for the entire composer component */
.lettercomposer {
  position: relative;
  max-width: calc(720px + 2 * var(--xs-spacing));
  margin: 0 auto;
  width: 100%;
  padding: var(--xs-spacing);
}

.trigger-button {
  border-radius: 8px;
  border: 1px solid var(--stroke);
  padding: var(--s-spacing) var(--m-spacing);
  font-size: 1rem;
  background-color: var(--background);
  color: var(--text2);
  font-weight: var(--medium);
  width: 100%;
  box-shadow: 0 2px 6px var(--background2);
}

.trigger-button:hover {
  filter: brightness(1.25);
}

/* --- Expanded composer view (overlay) --- */
.composer-wrapper {
  position: fixed;
  top: var(--xl-spacing);
  left: var(--m-spacing);
  right: var(--m-spacing);
  bottom: var(--m-spacing);
  background-color: var(--background2, #fff);
  border: var(--border, 1px solid #ddd);
  border-radius: 12px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.composer-header {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
}

.close-button {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.composer-container {
  flex: 1;
  overflow: auto;
  padding: var(--m-spacing, 16px);
  transition: all 0.3s ease-in-out;
}

/* --- Modal styles --- */
.modal {
  position: fixed;
  top: 44px;
  right: var(--xs-spacing, 16px);
  z-index: 1100;
}

.modal-content {
  background-color: var(--background2, #fff);
  padding: var(--xs-spacing, 8px);
  border-radius: var(--radius, 4px);
  border: var(--border, 1px solid #ddd);
  display: flex;
  flex-direction: column;
  gap: var(--xs-spacing, 8px);
}

.letter-link {
  padding: var(--xs-spacing, 8px);
  background-color: var(--background2, #fff);
  border-radius: var(--radius, 4px);
  border: var(--border, 1px solid #ddd);
  transition: var(--transition, 0.3s);
  flex: 1;
  width: 15em;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.letter-link:hover {
  filter: brightness(95%);
}

.copy-letter {
  display: flex;
  gap: var(--xs-spacing, 8px);
  align-items: center;
}

/* --- Fade transition for modal --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
