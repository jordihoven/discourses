<template>
  <div class="letterviewer">
    <PageHeader />
    <div class="letter-container">
      <div v-if="letterContent" class="letter">
        <div v-for="block in letterContent.blocks" :key="block.id" class="block">
          <!-- Render content dynamically based on block type -->
          <h2 v-if="block.type === 'header'">{{ block.data.text }}</h2>
          <p v-else>{{ block.data.text }}</p>
        </div>
      </div>
      <div v-else>
        <p>Loading your note...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import PageHeader from '@/components/organisms/PageHeader.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const letterContent = ref(null)
const fetchLetter = async (id) => {
  const { data, error } = await supabase.from('notes').select('content_json').eq('id', id).single() // Fetch a single row
  if (error) {
    console.error('Error fetching letter:', error.message)
    return
  }
  letterContent.value = data.content_json // Editor.js content is stored as JSON
}

onMounted(() => {
  const id = window.location.pathname.split('/note/')[1] // Extract the `id` from URL
  fetchLetter(id)
})

function openDiscourses() {
  const letterComposerPath = router.resolve({ name: 'LetterComposer' }).href
  window.open(letterComposerPath, '_blank') // push user to letterComposer in a new tab...
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
  border-radius: var(--radius);
  transition: var(--transition);
  padding: var(--xs-spacing);
}

.letter .block:hover {
  background-color: var(--background);
  cursor: pointer;
}

.letter {
  padding: 4vw;
}

.written-in {
  display: flex;
  align-items: center;
  gap: var(--xs-spacing);
}
</style>
