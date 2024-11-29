<template>
  <RouterView />
  <section id="toaster-wrapper" data-position="bottom-center"></section>
  <!-- <div v-if="isSmallScreen" class="overlay">
    <div class="message">
      <h1>📺</h1>
      <p class="medium">Use a larger screen</p>
      <span>Discourses is build for deep, thoughtfull conversation. It's not a place to find short, meaningless distractions.</span>
    </div>
  </div> -->
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Create a reactive ref for the screen size check
const isSmallScreen = ref(false)

// Function to check the screen size
const checkScreenSize = () => {
  isSmallScreen.value = window.innerWidth < 600 // Adjust the threshold as needed
}

// Run the check when the component mounts
onMounted(() => {
  checkScreenSize() // Check screen size on mount
  window.addEventListener('resize', checkScreenSize) // Add resize event listener
})

// Clean up event listener when the component is unmounted
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<style scoped>
/* Styles for the 'Use a larger screen' message */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7); /* Semi-transparent black background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure it stays on top of the content */
}

/* Centered message style */
.message {
  display: flex;
  flex-direction: column;
  gap: var(--xs-spacing);
  text-align: center;
  max-width: 80%;
}
.message p {
  color: white;
}
.message span {
  color: darkgrey;
}
</style>
