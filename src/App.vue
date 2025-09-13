<script setup lang="ts">
import { supabase } from './services/supabase';
import LoginPanel from './views/LoginPanel.vue';
import { ref, Ref, onMounted, onUnmounted, computed } from 'vue';
import { Session } from '@supabase/supabase-js';
import {
  NConfigProvider,
  NGlobalStyle,
  darkTheme,
  lightTheme,
  NButton,
  GlobalTheme,
} from 'naive-ui';
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

const theme: Ref<GlobalTheme> = ref(darkTheme);

const isDarkTheme = computed(() => theme.value.name === darkTheme.name);

function toggleTheme() {
  theme.value = isDarkTheme.value ? lightTheme : darkTheme;
}
</script>

<template>
  <n-config-provider
    :theme="theme"
    :theme-overrides="{
      Button: {
        textColorPrimary: 'var(--color-primary)', // idle text color
      },
    }"
  >
    <n-global-style />
    <div
      class="min-h-screen"
      :class="isDarkTheme ? 'bg-gray-950' : 'bg-white'"
    >
      <n-button @click="toggleTheme">
        Switch to {{ isDarkTheme ? 'Light' : 'Dark' }} Theme
      </n-button>
      <router-view />
    </div>
  </n-config-provider>
</template>

<style scoped>
:root {
  --color-primary: #63e2b7;
}
.container {
  padding: 2rem;
  font-family: sans-serif;
}
</style>
