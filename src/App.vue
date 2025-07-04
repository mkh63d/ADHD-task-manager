<script setup lang="ts">
import UiShowcase from './components/UiShowcase.vue';
import { supabase } from './services/supabase';
import LoginPanel from './views/LoginPanel.vue';
import { ref, onMounted, onUnmounted } from 'vue';
import TaskManager from './views/TaskManager.vue';
import { Session } from '@supabase/supabase-js';

const session = ref<Session | null>(null);

onMounted(async () => {
  const {
    data: { session: currentSession },
  } = await supabase.auth.getSession();
  session.value = currentSession;

  const { data: authListener } = supabase.auth.onAuthStateChange(
    (_event, newSession) => {
      session.value = newSession;
    },
  );

  console.log('Session:', session.value);

  onUnmounted(() => {
    session.value = null;
    authListener.subscription.unsubscribe();
  });
});
</script>

<template>
  <div class="bg-gray-950 min-h-screen">
    <div class="container">
      <LoginPanel />
      <TaskManager />
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 2rem;
  font-family: sans-serif;
}
</style>
