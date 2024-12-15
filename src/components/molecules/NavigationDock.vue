<template>
  <nav>
    <div class="nav-item"><router-link active-class="active" to="/">Compose Letter</router-link></div>
    <div class="nav-item"><router-link active-class="active" to="/drafts">Drafts</router-link></div>
  </nav>
</template>
<!-- fixme: might need router here, could be that it breaks if the page we're routing away from does not have a router instance... -->

<script>
export default {
  name: 'NavigationDock',
  setup() {
    return {}
  }
}
</script>

<style scoped>
nav {
  display: flex;
  gap: var(--xs-spacing);
  border-radius: 50px;
  border: var(--border);
  padding: 2px;
}

.nav-item a {
  border-radius: 50px;
  padding: 4px var(--xs-spacing);
  color: var(--text2);
  display: flex;
}

.active {
  background-color: var(--background2);
}
</style>
