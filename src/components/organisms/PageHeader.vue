<template>
  <div class="header-wrapper">
    <header class="page-header">
      <User class="header-user" />
      <NavigationDock class="header-nav" />
      <div class="header-actions">
        <slot name="actions"></slot>
        <div class="actionlist-toggle" @click="toggleDropdown" ref="toggleButton">
          <LucideEllipsis class="icon ellipsis-icon" />
        </div>
      </div>
    </header>
    <ul v-if="isDropdownOpen" id="actionlist" ref="dropdownMenu">
      <li class="action" @click="handleAction('clear')"><LucideWind class="icon" /> Clear thought</li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import User from '@/components/molecules/UserProfile.vue'
import NavigationDock from '@/components/molecules/NavigationDock.vue'

const isDropdownOpen = ref(false)
const dropdownMenu = ref(null)
const toggleButton = ref(null)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// Use VueUse's onClickOutside to close dropdown when clicking outside
onClickOutside(
  dropdownMenu,
  () => {
    isDropdownOpen.value = false
  },
  { ignore: [toggleButton] }
) // Ignore clicks on the toggle button

const handleAction = (action) => {
  console.log(`Action triggered: ${action}`)
  isDropdownOpen.value = false
}
</script>

<style scoped>
.header-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

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
  align-items: center;
}

.ellipsis-icon {
  color: var(--text2);
}

.actionlist-toggle {
  transition: var(--transition);
  border-radius: 6px;
  padding: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.actionlist-toggle:hover {
  background-color: var(--background);
  cursor: pointer;
}

/* Dropdown styles */
#actionlist {
  position: absolute;
  top: calc(var(--l-spacing) + 4px);
  right: var(--xs-spacing);
  background: var(--background2);
  border: 1px solid var(--stroke);
  border-radius: var(--radius);
  min-width: 150px;
  z-index: 69;
  padding: 4px;
}

ul#actionlist {
  list-style: none;
  margin: 0;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

#actionlist .action {
  padding: 6px var(--xs-spacing);
  cursor: pointer;
  transition: var(--transition);
  border-radius: var(--radius);

  display: flex;
  gap: 4px;
  align-items: center;
}

#actionlist .action:hover {
  background: var(--stroke);
}
</style>
