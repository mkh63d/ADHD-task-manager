import './assets/main.css';
import { createApp } from 'vue'
import App from './App.vue'
import { supabase } from './services/supabase';

const app = createApp(App)
app.provide('supabase', supabase);
app.mount('#app')
