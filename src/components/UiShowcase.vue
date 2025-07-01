<template>
  <div>
    <h1>Welcome to the Vue Starter Template 🚀</h1>
    <button @click="clicked = !clicked">Toggle</button>
    <p v-if="clicked">🎉 You clicked it!</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const clicked = ref(false)
</script>

<style scoped>
button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
}
</style>
