import { createRouter, createWebHistory } from 'vue-router'
import LetterComposer from '@/views/LetterComposer.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'LetterComposer',
      component: LetterComposer
    }
  ]
})

export default router
