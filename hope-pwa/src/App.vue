<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: sans-serif;
  background-color: #ffffff;
}

.app-container {
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
}

.main-content {
  width: 100%;
}
</style>