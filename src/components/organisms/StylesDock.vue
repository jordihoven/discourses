<template>
  <div class="dock">
    <div class="block">Heading</div>
    <div class="block">Body</div>
  </div>
</template>

<script setup></script>

<style scoped>
.dock {
  border: var(--border);
  border-radius: var(--radius);
  background-color: var(--background);
  padding: var(--xs-spacing);
  width: fit-content;
  display: flex;
  gap: var(--xs-spacing);
  position: fixed;
  bottom: var(--m-spacing);
  left: 50%;
  transform: translate(-50%);
  z-index: 69;
}

.block {
  padding: var(--xs-spacing);
  border: var(--border);
  border-radius: var(--radius-sm);
  background-color: var(--background2);
  transition: var(--transition);
}
.block:hover {
  cursor: pointer;
}
</style>
