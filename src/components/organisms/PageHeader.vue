<template>
  <header class="page-header">
    <User class="header-user" />
    <NavigationDock class="header-nav" />
    <div class="header-actions">
      <slot name="actions"></slot>
    </div>
  </header>
</template>

<script>
import User from '@/components/molecules/User.vue'
import NavigationDock from '@/components/molecules/NavigationDock.vue'

export default {
  components: {
    User,
    NavigationDock
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--xs-spacing);
  border-bottom: var(--border);
  padding: var(--xs-spacing);
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
