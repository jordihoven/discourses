<template>
  <div :class="{ 'modal-active': showModal }" class="lettercomposer">
    <header>
      <button @click="thrashDraft" :disabled="!editorContent">
        <LucideRemoveFormatting class="icon"></LucideRemoveFormatting>
        Thrash draft
      </button>
      <button @click="openModal" :disabled="!editorContent"><LucideMailbox class="icon" />Share letter</button>
    </header>
    <div class="letter-container">
      <div ref="editor" class="letter"></div>
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

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'toaster-ts'
import { useClipboard, onClickOutside } from '@vueuse/core'

export default {
  name: 'LetterComposer',
  setup() {
    const editor = ref(null)
    let editorInstance = null
    const editorContent = ref(null)
    const showModal = ref(false)
    const generatedLink = ref('')
    const isGenerating = ref(false)
    const { copy } = useClipboard()
    const modal = ref(null) // Reference for the modal

    onMounted(() => {
      // Initialize Editor.js
      editorInstance = new EditorJS({
        holder: editor.value,
        tools: {
          header: Header
        },
        placeholder: "What's on your mind?",
        onChange: async () => {
          // Update the reactive property with editor content
          const content = await editorInstance.save()
          editorContent.value = content.blocks.length > 0 ? content : null
        }
      })
    })

    onBeforeUnmount(() => {
      if (editorInstance) {
        // Destroy the editor instance when the component is destroyed
        editorInstance.destroy()
      }
    })

    const thrashDraft = async () => {
      if (editorInstance) {
        await editorInstance.render({ blocks: [] })
        editorContent.value = null // Clear reactive property
        toast.success('Draft cleared 🍃')
      }
    }

    const generateLetterLink = async () => {
      if (!editorInstance) return
      try {
        isGenerating.value = true
        const content = await editorInstance.save()
        const { data, error } = await supabase
          .from('letters')
          .insert([{ content_json: content }])
          .select()

        if (error) throw error

        const letterId = data[0].id
        generatedLink.value = `${window.location.origin}/letter/${letterId}`
        toast.success('Link generated successfully! 🎉')

        showModal.value = true // Show the modal once the link is generated
      } catch (err) {
        console.error('Error generating link: ', err.message)
        toast.error('Something went wrong 🙊 ', err.message)
      } finally {
        isGenerating.value = false
      }
    }

    const copyLink = () => {
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

    return {
      editor,
      thrashDraft,
      editorContent,
      generatedLink,
      isGenerating,
      showModal,
      copyLink,
      openModal,
      closeModal,
      generateLetterLink,
      modal
    }
  }
}
</script>

<style scoped>
.lettercomposer {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* editor.js overrides  */
:deep(.ce-block--selected .ce-block__content) {
  background-color: var(--stroke);
  border-radius: var(--radius);
}
:deep(.codex-editor) {
  height: 0;
}

header {
  display: flex;
  gap: var(--xs-spacing);
}

.modal {
  position: fixed;
  top: 44px;
  right: var(--xs-spacing);
  z-index: 999;
}

.modal-content {
  background-color: var(--bg-primary);
  padding: var(--xs-spacing);
  border-radius: var(--radius);
  border: var(--border);
  display: flex;
  flex-direction: column;
  gap: var(--xs-spacing);
}

.letter-link {
  padding: var(--xs-spacing);
  background-color: var(--bg-secondary);
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

.modal-active .letter-container {
  pointer-events: none; /* Disable pointer events for the editor when the modal is visible */
}
.copy-letter {
  display: flex;
  gap: var(--xs-spacing);
  align-items: center;
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
