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
import LetterComposer from '@/components/organisms/ThoughtComposer.vue'
import ThoughtList from '@/components/organisms/ThoughtList.vue'

// You might manage a draftId from query params or state here, if needed
const draftId = ref(null)

const isVisible = ref(false)

function handleOpenDraft(id) {
  console.log('open draft received', id)
  if (window.innerWidth < 992) isVisible.value = false
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
  /* hidden by default */
  background-color: var(--background1);
  z-index: 69;
  transition: var(--fast-transition);
}

@media (min-width: 992px) {
  /* Sidebar hidden state */
  #thoughtsList {
    width: 0;
  }
  /* Sidebar visible state */
  #thoughtsList.visible {
    width: 240px;
  }
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
