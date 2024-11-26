<template>
  <div class="app-container">
    <header>
      <button><LucideSparkles class="icon" />Send letter</button>
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

    return {
      editor
    }
  }
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.letter-container {
  padding: var(--m-spacing);
  height: 100%;
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

header {
  border-bottom: var(--border);
  display: flex;
  align-items: center;
  justify-content: end;
  padding: var(--xs-spacing);
}

/* editor.js overrides  */
:deep(.ce-block--selected .ce-block__content) {
  background-color: var(--stroke);
  border-radius: var(--radius);
}

:deep(.codex-editor) {
  height: 0;
}
</style>
