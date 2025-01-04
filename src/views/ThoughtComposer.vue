<template>
  <div :class="{ 'modal-active': showModal }" class="lettercomposer">
    <PageHeader>
      <template #actions>
        <button @click="openModal" :disabled="!editorContent">Share</button>
      </template>
    </PageHeader>
    <div class="composer-container">
      <div ref="editor" class="editorjs" :class="{ disabled: generatedLink }"></div>
    </div>
    <!-- Modal to show generated link and copy option -->
    <transition name="fade">
      <div v-if="showModal" ref="modal" class="modal">
        <div class="modal-content">
          <span>Share your letter to anyone, anywhere.</span>
          <div v-if="!generatedLink" class="copy-letter">
            <a class="letter-link disabled" href="#">discourses.app/letter/...</a>
            <button @click="generateLetterLink" :disabled="isGenerating">
              <LucideLink class="icon" />
              {{ isGenerating ? 'Generating...' : 'Create Link' }}
            </button>
          </div>
          <div v-else class="copy-letter">
            <a class="letter-link" :href="generatedLink" target="_blank">{{ generatedLink }}</a>
            <button @click="copyLink">
              <LucideCopy class="icon" />
              Copy link
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'toaster-ts'
import { useClipboard, onClickOutside } from '@vueuse/core'
import PageHeader from '@/components/organisms/PageHeader.vue'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  draftId: {
    type: String,
    required: false,
    default: null
  }
})

// Add debounce utility
function debounce(func, wait) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

const editor = ref(null)
let editorInstance = null
const editorContent = ref(null)
const showModal = ref(false)
const generatedLink = ref(null)
const isGenerating = ref(false)
const { copy } = useClipboard()
const modal = ref(null)

const draftId = ref(props.draftId) // Use the draftId from props
const saving = ref(false)

const userStore = useUserStore() // Access the Pinia user store

// Fetch the draft content when the component is mounted
const fetchDraft = async (draftId) => {
  try {
    const { data, error } = await supabase.from('letters').select('content_json').eq('id', draftId).single()
    if (error) throw error
    // Initialize the editor with the fetched draft content
    if (data) {
      editorContent.value = data.content_json
      editorInstance.render(editorContent.value) // Load the content into the editor
    }
  } catch (err) {
    toast.error('Failed to load draft: ' + err.message)
  }
}

onMounted(() => {
  // Initialize Editor.js
  editorInstance = new EditorJS({
    holder: editor.value,
    tools: {
      header: Header
    },
    autofocus: true,
    placeholder: 'Type here...',
    inlineToolbar: ['bold', 'italic'],
    onChange: async () => {
      // Update the reactive property with editor content
      const content = await editorInstance.save()
      editorContent.value = content.blocks.length > 0 ? content : null
      await debouncedSaveDraft(content)
    }
  })

  // If there's a draftId, fetch and load the draft content
  if (draftId.value) {
    fetchDraft(draftId.value)
  }
})

async function saveDraft(content) {
  if (saving.value) return // Prevent multiple simultaneous saves
  saving.value = true

  try {
    const userId = userStore.user?.id

    if (!userId) {
      throw new Error('User not authenticated or user ID missing')
    }

    if (!content || content.blocks.length === 0) {
      // If content is empty, delete the draft
      if (draftId.value) {
        await deleteDraft(draftId.value)
        draftId.value = null
      }
      return
    }

    if (!draftId.value) {
      // Insert a new draft
      const { data, error } = await supabase
        .from('letters')
        .insert([{ content_json: content, user_id: userId, status: 'draft' }])
        .select()

      if (error) throw error

      draftId.value = data[0]?.id
    } else {
      // Update existing draft
      const { error } = await supabase.from('letters').update({ content_json: content, status: 'draft' }).eq('id', draftId.value)
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

const debouncedSaveDraft = debounce(saveDraft, 1200)

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

onBeforeUnmount(() => {
  if (editorInstance) {
    // Destroy the editor instance when the component is destroyed
    editorInstance.destroy()
  }
})

async function generateLetterLink() {
  if (!editorInstance) return
  try {
    isGenerating.value = true
    const content = await editorInstance.save()

    if (draftId.value) {
      // Update the existing draft with new content and status "sent"
      const { data, error } = await supabase.from('letters').update({ content_json: content, status: 'sent' }).eq('id', draftId.value)

      if (error) throw error

      generatedLink.value = `${window.location.origin}/letter/${draftId.value}` // Use the draftId in the link
      toast.success('Link generated successfully! 🎉')
      showModal.value = true
    } else {
      // Create a new row if no draft exists
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
    toast.error('Something went wrong 🙊 ', err.message)
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

const openModal = () => {
  showModal.value = true
}
const closeModal = () => {
  showModal.value = false
}

onClickOutside(modal, closeModal)
</script>

<style scoped>
.lettercomposer {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.modal {
  position: fixed;
  top: 44px;
  right: var(--xs-spacing);
  z-index: 999;
}

.modal-content {
  background-color: var(--background2);
  padding: var(--xs-spacing);
  border-radius: var(--radius);
  border: var(--border);
  display: flex;
  flex-direction: column;
  gap: var(--xs-spacing);
}

.letter-link {
  padding: var(--xs-spacing);
  background-color: var(--background2);
  border-radius: var(--radius);
  border: var(--border);
  transition: var(--transition);
  flex: 1;
  width: 15em;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.letter-link:hover {
  filter: brightness(95%);
}

.modal-active .composer-container {
  pointer-events: none; /* Disable pointer events for the editor when the modal is visible */
}

.composer-container {
  padding: var(--xl-spacing) var(--m-spacing);
  height: 100%;
  flex: 1;
  overflow: auto;
}

.copy-letter {
  display: flex;
  gap: var(--xs-spacing);
  align-items: center;
}

.shared-notice {
  text-align: center;
  padding: var(--xs-spacing);
  border: var(--border);
  border-radius: var(--radius);
  width: fit-content;
  position: absolute;
  background-color: var(--background2);
  left: 50%;
  transform: translateX(-50%);
  top: 6em;
  gap: var(--xs-spacing);
  display: flex;
  flex-direction: column;
}
.shared-notice button {
  width: 100%;
  justify-content: center;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
