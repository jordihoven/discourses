<template>
  <div :class="{ 'modal-active': showModal }" class="lettercomposer">
    <PageHeader>
      <template #actions>
        <button @click="openModal" :disabled="!editorContent"><LucideMailbox class="icon" />Share letter</button>
      </template>
    </PageHeader>
    <div class="letter-container">
      <div ref="editor" class="letter" :class="{ disabled: generatedLink }"></div>
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
import PageHeader from '@/components/organisms/PageHeader.vue'
import { useUserStore } from '@/stores/user'

export default {
  name: 'LetterComposer',
  components: {
    PageHeader
  },
  props: {
    draftId: {
      type: String,
      required: false,
      default: null
    }
  },
  setup(props) {
    const editor = ref(null)
    let editorInstance = null
    const editorContent = ref(null)
    const showModal = ref(false)
    const generatedLink = ref(null)
    const isGenerating = ref(false)
    const { copy } = useClipboard()
    const modal = ref(null) // Reference for the modal

    const draftId = ref(props.draftId) // Use the draftId from route query
    const saving = ref(false) // Track if a save is in progress

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
        placeholder: "Let's start writing...",
        autofocus: true,
        inlineToolbar: ['bold', 'italic'],
        onChange: async () => {
          // Update the reactive property with editor content
          const content = await editorInstance.save()
          editorContent.value = content.blocks.length > 0 ? content : null
          await saveDraft(content)
        }
      })
      // If there's a draftId, fetch and load the draft content

      if (draftId.value) {
        fetchDraft(draftId.value)
      }
    })

    const saveDraft = async (content) => {
      if (saving.value) return // Prevent multiple simultaneous saves
      saving.value = true

      try {
        const userId = userStore.user?.id

        if (!userId) {
          throw new Error('User not authenticated or user ID missing')
        }

        if (!draftId.value) {
          // Insert a new draft
          console.log('Creating a new draft with content and user_id...')
          const { data, error } = await supabase
            .from('letters')
            .insert([{ content_json: content, user_id: userId, status: 'draft' }])
            .select()

          console.log('Insert Query Response:', data)
          if (error) throw error

          draftId.value = data[0]?.id
        } else {
          // Update existing draft
          console.log(`Updating draft with ID: ${draftId.value}`)
          const { error } = await supabase.from('letters').update({ content_json: content, status: 'draft' }).eq('id', draftId.value)

          if (error) throw error

          console.log('Draft updated successfully')
        }

        toast.success('Draft saved')
      } catch (err) {
        console.error('Error saving draft:', err.message)
        toast.error('Failed to save draft')
      } finally {
        saving.value = false
      }
    }

    onBeforeUnmount(() => {
      if (editorInstance) {
        // Destroy the editor instance when the component is destroyed
        editorInstance.destroy()
      }
    })

    const generateLetterLink = async () => {
      if (!editorInstance) return
      try {
        isGenerating.value = true
        const content = await editorInstance.save()

        // Check if there is an existing draft (draftId exists)
        if (draftId.value) {
          // Update the existing draft with new content and status "sent"
          const { data, error } = await supabase.from('letters').update({ content_json: content, status: 'sent' }).eq('id', draftId.value) // Update the row that matches the draftId

          if (error) throw error

          generatedLink.value = `${window.location.origin}/letter/${draftId.value}` // Use the draftId in the link
          toast.success('Link generated successfully! 🎉')
          showModal.value = true // Show the modal once the link is generated
        } else {
          // If no draft exists, create a new row (fallback)
          const { data, error } = await supabase
            .from('letters')
            .insert([{ content_json: content, status: 'sent' }])
            .select()

          if (error) throw error

          const letterId = data[0].id
          generatedLink.value = `${window.location.origin}/letter/${letterId}`
          toast.success('Link generated successfully! 🎉')
          showModal.value = true // Show the modal once the link is generated
        }
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
      editorContent,
      generatedLink,
      isGenerating,
      showModal,
      copyLink,
      openModal,
      closeModal,
      generateLetterLink,
      modal,
      saveDraft
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

.modal {
  position: fixed;
  top: 44px;
  right: var(--xs-spacing);
  z-index: 999;
}

.modal-content {
  background-color: var(--background1);
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

.modal-active .letter-container {
  pointer-events: none; /* Disable pointer events for the editor when the modal is visible */
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
