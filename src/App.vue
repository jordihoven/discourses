<template>
  <!-- <RouterView /> -->
  <div class="wrapper">
    <PageHeader />
    <ThoughtComposer class="composer" />
    <ThoughtList v-if="userStore?.user" class="list" />
  </div>
  <section id="toaster-wrapper" data-position="top-center"></section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import ThoughtComposer from '@/views/ThoughtComposer.vue'
import PageHeader from '@/components/organisms/PageHeader.vue'
import ThoughtList from '@/views/ThoughtList.vue'

const userStore = useUserStore()

onMounted(async () => {
  userStore.initializeAuthListener()
  await userStore.fetchUser()
})
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.wrapper .composer {
  flex: 1;
  margin-top: var(--l-spacing);
  margin-bottom: var(--m-spacing);
}
</style>
