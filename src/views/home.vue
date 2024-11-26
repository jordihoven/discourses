<template>
  <div class="app-container">
    Vuemencer.
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { toast } from 'toaster-ts'

// components
import Dropzone from '../components/molecules/Dropzone.vue'

</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
</style>
