import './assets/main.css';
import { createApp } from 'vue'
import App from './App.vue'
import { supabase } from './services/supabase';
import router from './router';

const app = createApp(App)
app.provide('supabase', supabase);
app.use(router);
app.mount('#app')


