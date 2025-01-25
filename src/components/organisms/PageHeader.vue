<template>
  <header class="page-header">
    <User class="header-user" />
    <NavigationDock class="header-nav" />
    <div class="header-actions">
      <slot name="actions"></slot>
    </div>
  </header>
</template>

<script setup>
import User from '@/components/molecules/UserProfile.vue'
import NavigationDock from '@/components/molecules/NavigationDock.vue'
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--xs-spacing);
  padding: var(--xs-spacing);
  border-bottom: var(--border);
}

.header-user {
  flex: 1;
}

.header-actions {
  display: flex;
  gap: var(--xs-spacing);
  flex: 1;
  justify-content: end;
}
</style>
