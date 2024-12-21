<template>
  <div>
    <nav>
      <div v-for="item in navItems" :key="item.to" class="nav-item">
        <router-link :to="item.to" active-class="active">
          <component :is="item.icon" class="icon" />
          {{ item.label }}
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { LucideFeather, LucideMailbox } from 'lucide-vue-next'

const navItems = [
  { to: '/', label: 'Composer', icon: LucideFeather },
  { to: '/mailbox', label: 'Mailbox', icon: LucideMailbox }
]
</script>

<style scoped>
nav {
  display: flex;
  border-radius: 50px;
  border: var(--border);
  padding: 2px;
  width: fit-content;
}

.nav-item a {
  border-radius: 50px;
  padding: 4px var(--xs-spacing);
  color: var(--text2);
  display: flex;
  align-items: center;
  gap: 4px;
  transition: var(--transition);
  background-color: transparent;
}

.nav-item .active {
  background-color: var(--stroke);
  color: var(--text2);
}
</style>
