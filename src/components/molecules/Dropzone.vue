<template>
  <div ref="dropZoneRef" class="dropzone" :class="{ dragover: isOverDropZone }" @click="openFileExplorer">
    <LucideSparkles class="icon" />
    <p class="medium">Add a .torrent file</p>
    <span>Drag and drop, or use explorer.</span>
    <input type="file" :accept="props.acceptedTypes" ref="fileInput" @change="handleFilesSelected" hidden />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDropZone } from '@vueuse/core'

// Define props for the component
const props = defineProps({
  acceptedTypes: {
    type: String,
    required: true
  },
  onFileUpload: {
    type: Function,
    required: true
  }
})

// Refs for the drop zone and file input
const dropZoneRef = ref(null)
const fileInput = ref(null)

// Handle file selection from the input
const handleFilesSelected = (event) => {
  const files = event.target.files
  onDrop(files) // Call the onDrop function
}

// Define the function to handle file drops
const onDrop = (files) => {
  if (files.length > 0) {
    props.onFileUpload(files) // Call the function passed from the parent
  }
}

// Open the file explorer
const openFileExplorer = () => {
  fileInput.value.click()
}

// Set up the drop zone functionality
const { isOverDropZone } = useDropZone(dropZoneRef, onDrop)
</script>

<style scoped>
.dropzone {
  background-color: var(--background2);
  border: 2px dashed var(--stroke);
  border-radius: var(--radius);
  padding: var(--s-spacing);
  text-align: center;
  transition: var(--transition);
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--xs-spacing);
}

.dropzone:hover {
  cursor: pointer;
  filter: brightness(95%);
}

.dropzone.dragover {
  border-color: var(--primary);
}
</style>
