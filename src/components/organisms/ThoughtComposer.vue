<template>
  <div :class="{ 'modal-active': showModal }" class="lettercomposer">
    <main class="composer-container">
      <div ref="editor" class="editorjs" :class="{ disabled: generatedLink }"></div>
    </main>
    <!-- Modal to show generated link and copy option -->
    <transition name="fade">
      <div v-if="showModal" ref="modal" class="modal">
        <div class="modal-content">
          <span>Share thought to anyone by link.</span>
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
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'toaster-ts'
import { useClipboard, onClickOutside } from '@vueuse/core'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  draftId: {
    type: String,
    required: false,
    default: null
  },
  shareButtonRef: { type: Object, required: false }
})

const emit = defineEmits(['update:draftId', 'thoughtChanged'])

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
const generatedLink = ref(null)
const isGenerating = ref(false)
const { copy } = useClipboard()
const modal = ref(null)

const saving = ref(false)

const userStore = useUserStore() // Access the Pinia user store

// Fetch the draft content when the component is mounted
const fetchDraft = async (draftId) => {
  try {
    const { data, error } = await supabase.from('notes').select('content_json').eq('id', draftId).single()
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

watch(
  () => props.draftId,
  (newDraftId, oldDraftId) => {
    if (newDraftId && newDraftId !== oldDraftId) {
      fetchDraft(newDraftId)
    }
  }
)

onMounted(() => {
  editorInstance = new EditorJS({
    holder: editor.value,
    tools: {
      header: Header
    },
    autofocus: true,
    placeholder: "What's on your mind?...",
    inlineToolbar: ['bold', 'italic'],
    onChange: async () => {
      const content = await editorInstance.save()
      editorContent.value = content.blocks.length > 0 ? content : null
      await debouncedSaveDraft(content)
    }
  })

  // Listen for click events on the editor container
  editor.value.addEventListener('click', (event) => {
    const activeBlock = event.target.closest('.ce-block')
    if (activeBlock) {
      console.log('Active block element:', activeBlock)
      const blockId = activeBlock.getAttribute('data-id')
      if (blockId) {
        const blockIndex = editorInstance.blocks.getBlockIndex(blockId)
        console.log('Active block index:', blockIndex)
        updateBlockOpacity(blockIndex)
      }
    }
  })

  // Listen for keyup events (this covers when a new block is created via Enter or user navigates)
  editor.value.addEventListener('keyup', () => {
    // Use a small delay if needed so that the new block is rendered.
    setTimeout(updateActiveBlockBySelection, 10)
  })

  // If there's a draftId, fetch and load the draft content
  if (props.draftId) {
    fetchDraft(props.draftId)
  }
})

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

  // Get the closest parent block element
  const activeBlock =
    focusedNode.nodeType === Node.ELEMENT_NODE ? focusedNode.closest('.ce-block') : focusedNode.parentElement.closest('.ce-block')

  if (activeBlock) {
    const blockId = activeBlock.getAttribute('data-id')
    if (blockId) {
      const blockIndex = editorInstance.blocks.getBlockIndex(blockId)
      console.log('Active block index from selection:', blockIndex)
      updateBlockOpacity(blockIndex)
      // Scroll active block into view
      activeBlock.scrollIntoView({
        behavior: 'smooth',
        block: 'center' // or "nearest" if you prefer minimal scrolling
      })
    }
  }
}

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
      if (props.draftId) {
        await deleteDraft(props.draftId)
        emit('update:draftId', null)
      }
      return
    }

    if (!props.draftId) {
      // Insert a new draft
      const { data, error } = await supabase
        .from('notes')
        .insert([{ content_json: content, user_id: userId, status: 'draft' }])
        .select()

      if (error) throw error
      emit('update:draftId', data[0]?.id)
    } else {
      // Update existing draft
      const { error } = await supabase.from('notes').update({ content_json: content, status: 'draft' }).eq('id', props.draftId)
      if (error) throw error
    }
    toast.success('Note saved 💾')
    emit('thoughtChanged') // emit event to update thoughtlist...
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
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) throw error
    toast.success('Note deleted 🗑️')
    emit('thoughtChanged') // emit event to update thoughtlist...
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

    if (props.draftId) {
      // Update the existing draft with new content and status "sent"
      const { error } = await supabase.from('notes').update({ content_json: content, status: 'sent' }).eq('id', props.draftId)

      if (error) throw error

      generatedLink.value = `${window.location.origin}/note/${props.draftId}` // Use the draftId in the link
      toast.success('Link generated! 🎉')
      showModal.value = true
    } else {
      // Create a new row if no draft exists
      const { data, error } = await supabase
        .from('notes')
        .insert([{ content_json: content, status: 'sent' }])
        .select()

      if (error) throw error

      const letterId = data[0].id
      generatedLink.value = `${window.location.origin}/letter/${letterId}`
      toast.success('Link generated! 🎉')
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

// const shareButton = ref(null)
const showModal = ref(false)

const showShareModal = () => {
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  console.log('Modal closed via click outside')
}

if (props.shareButtonRef) {
  onClickOutside(modal, closeModal, { ignore: [props.shareButtonRef] })
} else {
  onClickOutside(modal, closeModal)
}

// handling the emitted action event from the pageheader...
const clearEditorBlocks = async () => {
  if (editorInstance) {
    // Call Editor.js's clear method.
    // Depending on your version, it might be editor.clear() or editor.blocks.clear().
    await editorInstance.clear()
  }
}

// In ThoughtComposer.vue
const newNote = async () => {
  if (editorInstance) {
    // Clear the editor content
    await editorInstance.clear()
  }
  // Set the draftId to null so that the empty state is not saved as a deletion
  // and a new draft will be created on subsequent edits.
  emit('update:draftId', null)
}

// expose the clear editor blocks method to the parent (homeview)
defineExpose({ clearEditorBlocks, newNote, showShareModal })
</script>

<style scoped>
.lettercomposer {
  display: flex;
  flex-direction: column;
  height: calc(100dvh - 46px);
  padding-bottom: env(safe-area-inset-bottom);
}

.modal {
  position: fixed;
  top: 44px;
  right: var(--xs-spacing);
  z-index: 1001;
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
  padding: var(--xl-spacing) var(--m-spacing) var(--huge-spacing) var(--m-spacing);
  height: 100%;
  flex: 1;
  overflow: auto;
  background-color: var(--background2);
  border: var(--border);
  border-radius: var(--radius);
  margin-left: var(--xs-spacing);
  margin-right: var(--xs-spacing);
  margin-bottom: var(--xs-spacing);
  margin-top: 0;
}

@media only screen and (max-width: 992px) {
  .composer-container {
    padding: var(--m-spacing) var(--m-spacing) var(--l-spacing) var(--m-spacing);
  }
}
@media only screen and (max-width: 660px) {
  .composer-container {
    padding: var(--m-spacing) var(--m-spacing) var(--l-spacing) var(--m-spacing);
    border: none;
    border-radius: 0;
    margin: 0;
  }
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
