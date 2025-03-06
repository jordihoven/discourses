<template>
  <div class="home-page">
    <AppHeader @toggleSidebar="isVisible = !isVisible" @clear="clearEditorBlocks" />
    <div class="home-content">
      <ThoughtList
        :class="{ visible: isVisible }"
        id="thoughtsList"
        ref="thoughtList"
        :refreshTrigger="refreshTrigger"
        @openDraft="handleOpenDraft"
      />
      <LetterComposer id="composer" v-model:draftId="draftId" @thoughtChanged="handleThoughtChanged" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '@/components/organisms/PageHeader.vue'
import LetterComposer from '@/views/ThoughtComposer.vue'
import ThoughtList from '@/views/ThoughtList.vue'

// You might manage a draftId from query params or state here, if needed
const draftId = ref(null)

const isVisible = ref(false)

function handleOpenDraft(id) {
  console.log('open draft received', id)
  draftId.value = id
}

const refreshTrigger = ref(0)
function handleThoughtChanged() {
  // Update the refreshTrigger, which ThoughtList can watch.
  console.log('thought changed event triggered in home!')
  refreshTrigger.value++
}
</script>

<style scoped>
.home-content {
  display: flex;
}

#composer {
  flex: 1;
}

#thoughtsList {
  width: 240px;
  border-right: var(--border);
  background-color: var(--background1);
  z-index: 69;
  transition: var(--transition);
}

@media only screen and (max-width: 992px) {
  #thoughtsList {
    transform: translateX(-100%);
    position: absolute;
    left: 0;
  }
  #thoughtsList.visible {
    transform: translateX(0);
    width: 100%;
  }
}
</style>
