import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import LoginPanel from '../views/LoginPanel.vue'
import DisplayTasks from '../views/DisplayTasks.vue'

const routes: RouteRecordRaw[] = [
  //{ path: '/', name: 'Home', component: Home },
  //{ path: '/about', name: 'About', component: About }
  { path: '/login', name: 'Login', component: LoginPanel },
  { path: '/', redirect: { name: 'Login' } },
  { path: '/task-manager', name: 'Task display', component: DisplayTasks }
  //{ path: 'tasks', name: 'Tasks', component: TasksView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
