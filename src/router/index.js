import { createRouter, createWebHistory } from 'vue-router'
//import Home from '../views/Home.vue'
//import About from '../views/About.vue'
import LoginPanel from '../views/LoginPanel.vue'

const routes = [
  //{ path: '/', name: 'Home', component: Home },
  //{ path: '/about', name: 'About', component: About }
  { path: 'login', name: 'Login', component: LoginPanel },
  { path: '/', redirect: { name: 'Login' } },
  //{ path: 'tasks', name: 'Tasks', component: TasksView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
