import { createRouter, createWebHistory } from 'vue-router'
import DeepSeek from '@/views/deepseek/index.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DeepSeek,
    }
  ],
})

export default router
