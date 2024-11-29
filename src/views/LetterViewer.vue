<template>
  <div class="letterviewer">
    <header class="shared-header">
      <span>Written in</span>
      <button @click="openDiscourses">📜 Discourses</button>
    </header>
    <div class="letter-container">
      <div v-if="letterContent" class="letter">
        <div v-for="block in letterContent.blocks" :key="block.id" class="block">
          <!-- Render content dynamically based on block type -->
          <h2 v-if="block.type === 'header'">{{ block.data.text }}</h2>
          <p v-else>{{ block.data.text }}</p>
        </div>
      </div>
      <div v-else>
        <p>Loading your letter...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

export default {
  name: 'LetterViewer',
  setup() {
    const letterContent = ref(null)
    const fetchLetter = async (id) => {
      const { data, error } = await supabase.from('letters').select('content_json').eq('id', id).single() // Fetch a single row
      if (error) {
        console.error('Error fetching letter:', error.message)
        return
      }
      letterContent.value = data.content_json // Editor.js content is stored as JSON
    }

    onMounted(() => {
      const id = window.location.pathname.split('/letter/')[1] // Extract the `id` from URL
      fetchLetter(id)
    })

    function openDiscourses() {
      window.open('https://mydiscourses.netlify.app', '_blank')
    }

    return {
      letterContent,
      openDiscourses
    }
  }
}
</script>

<style scoped>
.letterviewer {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.letter .block {
  margin-bottom: 1em;
  border: 1px solid transparent;
  border-radius: var(--radius);
  transition: var(--transition);
  padding: var(--xs-spacing);
}

.letter .block:hover {
  background-color: var(--bg-secondary);
  border: var(--border);
  cursor: pointer;
}

.shared-header {
  display: flex;
  gap: var(--xs-spacing);
}

.letter {
  padding: 4vw;
}
</style>
