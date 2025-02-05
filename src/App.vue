<template>
  <RouterView />
  <section id="toaster-wrapper" data-position="top-center"></section>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(async () => {
  userStore.initializeAuthListener()
  await userStore.fetchUser()
})
</script>
