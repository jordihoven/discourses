<template>
  <div class="header-wrapper">
    <header class="page-header">
      <div class="left-actions">
        <div class="actionlist-toggle sidebar-button" ref="toggleSidebarButton" @click="toggleSidebar">
          <LucideSidebar class="icon ellipsis-icon" />
        </div>
        <User class="header-user" />
      </div>
      <div class="header-actions">
        <slot name="actions"></slot>
        <div class="actionlist-toggle" :class="{ active: isDropdownOpen }" @click="toggleDropdown" ref="toggleButton">
          <LucideEllipsis class="icon ellipsis-icon" />
        </div>
      </div>
    </header>
    <ul v-if="isDropdownOpen" id="actionlist" ref="dropdownMenu">
      <!-- <li class="action" @click="handleAction('clear')"><LucideSearch class="icon" />Search</li> -->
      <li class="action" @click="handleAction('new')"><LucideSquarePen class="icon" />New</li>
      <li class="action" @click="handleAction('clear')"><LucideWind class="icon" />Clear</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { onClickOutside } from '@vueuse/core'
import User from '@/components/molecules/UserProfile.vue'

const isDropdownOpen = ref(false)
const dropdownMenu = ref(null)
const toggleButton = ref(null)

const emit = defineEmits(['clear', 'new', 'share', 'toggleSidebar'])

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const toggleSidebar = () => {
  emit('toggleSidebar')
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
  if (action === 'clear') {
    emit('clear')
  }
  if (action === 'new') {
    emit('new')
  }
  isDropdownOpen.value = false
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--xs-spacing);
  padding: var(--xs-spacing);
  background-color: var(--background1);
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

.actionlist-toggle:hover,
.actionlist-toggle.active {
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
  z-index: 420;
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

/* todo: clean this left actions thing up! */
.left-actions {
  display: flex;
  gap: var(--xs-spacing);
  align-items: center;
}

/* todo: uglyness. should be done trough v-if? */
</style>
