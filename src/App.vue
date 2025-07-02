<script setup lang="ts">
import UiShowcase from './components/UiShowcase.vue';
import { supabase } from './services/supabase';
import LoginPanel from './services/LoginPanel.vue';

</script>

<template>
  <div class="container">
    <LoginPanel />
  </div>
</template>

<style scoped>
.container {
  padding: 2rem;
  font-family: sans-serif;
}
</style>
