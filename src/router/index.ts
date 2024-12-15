import { createRouter, createWebHistory } from 'vue-router'
import LetterComposer from '@/views/LetterComposer.vue'
import LetterViewer from '@/views/LetterViewer.vue'
import LetterDrafts from '@/views/LetterDrafts.vue'
import Login from '@/views/Login.vue' // Import the Login component
import { supabase } from '@/lib/supabaseClient'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'LetterComposer',
      component: LetterComposer,
      meta: { requiresAuth: true },
      props: (route) => ({ draftId: route.query.draftId })
    },
    {
      path: '/letter/:id',
      name: 'LetterViewer',
      component: LetterViewer,
      props: true
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/drafts',
      name: 'LetterDrafts',
      component: LetterDrafts,
      meta: { requiresAuth: true }
    }
  ]
})

// Route Guard to check authentication before each route
router.beforeEach(async (to, from, next) => {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (to.matched.some((record) => record.meta.requiresAuth) && !session) {
    // Redirect to the login page
    next({ name: 'Login' })
  } else {
    // Allow navigation
    next()
  }
})

export default router
