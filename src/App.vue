<script setup lang="ts">
import UiShowcase from './components/UiShowcase.vue';
import { supabase } from './services/supabase';
import LoginPanel from './views/LoginPanel.vue';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Session } from '@supabase/supabase-js';
//import { RouteComponent } from 'vue-router';

const session = ref<Session | null>(null);

const loggedIn = ref(false);

onMounted(async () => {
  const {
    data: { session: currentSession },
  } = await supabase.auth.getSession();
  session.value = currentSession;

  const { data: authListener } = supabase.auth.onAuthStateChange(
    (_event, newSession) => {
      session.value = newSession;
      loggedIn.value = true;
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
  <!--<RouteComponent>-->
    <div class="bg-gray-950 min-h-screen">
      <router-view />
    </div>
  <!--</RouteComponent>-->
</template>

<style scoped>
.container {
  padding: 2rem;
  font-family: sans-serif;
}
</style>
