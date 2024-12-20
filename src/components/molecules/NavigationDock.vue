<template>
  <div>
    <nav>
      <div class="nav-item">
        <router-link active-class="active" to="/">
          <LucideFeather class="icon" />
          Composer</router-link
        >
      </div>
      <div class="nav-item">
        <router-link active-class="active" to="/drafts">
          <LucideArchive class="icon" />
          Drafts
        </router-link>
      </div>
    </nav>
  </div>
</template>
<!-- fixme: might need router here, could be that it breaks if the page we're routing away from does not have a router instance... -->

<script setup></script>

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
}
.nav-item a:hover {
  filter: brightness(90%);
}

.nav-item .active {
  background-color: var(--background2);
  color: var(--text1);
}
</style>
