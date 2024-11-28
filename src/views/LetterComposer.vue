<template>
  <div class="lettercomposer">
    <header>
      <button @click="sendLetter"><LucideSparkles class="icon" />Send letter</button>
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

export default {
  name: 'LetterComposer',
  setup() {
    const editor = ref(null)
    let editorInstance = null

    onMounted(() => {
      // Initialize Editor.js
      editorInstance = new EditorJS({
        holder: editor.value,
        tools: {
          header: Header
        },
        placeholder: 'Start writing your letter here...'
      })
    })

    onBeforeUnmount(() => {
      if (editorInstance) {
        // Destroy the editor instance when the component is destroyed
        editorInstance.destroy()
      }
    })

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
              content_json: content, // Store the Editor.js JSON content
              content: JSON.stringify(content.blocks.map((block) => block.text)).replace(/["[\],]/g, ' ') // Optional: Save plain text
            }
          ])
          .select()
        if (error) throw error

        // Generate a link to view the letter
        const letterId = data[0].id
        const link = `${window.location.origin}/letter/${letterId}`
        // Copy the link to clipboard
        await navigator.clipboard.writeText(link)
        alert('Link copied to clipboard: ' + link)
      } catch (err) {
        console.error('Error sending letter:', err.message)
      }
    }

    return {
      editor,
      sendLetter
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
  max-height: 90%;
}
.letter {
  border: 1px solid var(--stroke);
  border-radius: var(--radius);
  max-width: 840px;
  margin: 0 auto;
  padding: var(--l-spacing) var(--xs-spacing);
  background-color: var(--bg-primary);
  height: 100%;
  overflow: auto;
  box-shadow: 0 2px var(--s-spacing) var(--bg-secondary);
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
</style>
