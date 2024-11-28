import { createRouter, createWebHistory } from 'vue-router'
import LetterComposer from '@/views/LetterComposer.vue'
import LetterViewer from '@/views/LetterViewer.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'LetterComposer',
      component: LetterComposer
    },
    {
      path: '/letter/:id',
      name: 'LetterViewer',
      component: LetterViewer,
      props: true
    }
  ]
})

export default router
