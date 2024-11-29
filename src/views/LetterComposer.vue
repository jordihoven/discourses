<template>
  <div class="lettercomposer">
    <header>
      <button @click="thrashDraft" :disabled="!editorContent">
        <LucideRemoveFormatting class="icon"></LucideRemoveFormatting>
        Thrash draft
      </button>
      <button @click="sendLetter"><LucideMailbox class="icon" />Send letter</button>
    </header>
    <div class="letter-container">
      <div ref="editor" class="letter"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'toaster-ts'
import { useClipboard } from '@vueuse/core'

export default {
  name: 'LetterComposer',
  setup() {
    const editor = ref(null)
    let editorInstance = null
    const editorContent = ref(null) // This will act like a v-model
    const { copy } = useClipboard()

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

    const sendLetter = async () => {
      if (!editorInstance) return
      try {
        // Save the Editor.js content
        const content = await editorInstance.save()
        // Insert the letter into the Supabase database
        const { data, error } = await supabase
          .from('letters')
          .insert([
            {
              content_json: content // Store the Editor.js JSON content
            }
          ])
          .select()
        if (error) throw error
        // Generate a link to view the letter
        const letterId = data[0].id
        const link = `${window.location.origin}/letter/${letterId}`
        copy(link) // copy link to clipboard using vueuse
        toast.success('Copied to clipboard! 🎉') // throw success toast
      } catch (err) {
        console.error('Error sending letter: ', err.message)
        toast.error('Something went wrong 🙊 ', err.message)
      }
    }
    return {
      editor,
      sendLetter,
      thrashDraft,
      editorContent
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

.letter-container {
  padding: var(--m-spacing);
  height: 100%;
  max-height: 95%;
}

/* editor.js overrides  */
:deep(.ce-block--selected .ce-block__content) {
  background-color: var(--stroke);
  border-radius: var(--radius);
}
:deep(.codex-editor) {
  height: 0;
}

@media only screen and (max-width: 1000px) {
  .letter-container {
    padding: var(--s-spacing);
    margin-bottom: 100px;
  }
}

header {
  display: flex;
  gap: var(--xs-spacing);
}
</style>
