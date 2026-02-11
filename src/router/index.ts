import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router';
import LoginPanel from '../views/LoginPanel.vue';
import DisplayTasks from '../views/DisplayTasks.vue';
import CalendarView from '../views/CalendarView.vue';

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: LoginPanel },
  { path: '/', redirect: { name: 'Login' } },
  { path: '/task-manager', name: 'Task display', component: DisplayTasks },
  { path: '/calendar', name: 'Calendar', component: CalendarView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
