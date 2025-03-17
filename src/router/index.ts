import { createRouter, createWebHistory } from 'vue-router'
// import Composer from '@/views/ThoughtComposer.vue'
import Reader from '@/views/ThoughtReader.vue'
import Thoughts from '@/components/organisms/ThoughtList.vue'
import Login from '@/views/UserLogin.vue'
import { supabase } from '@/lib/supabaseClient'

import Home from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/note/:id',
      name: 'LetterViewer',
      component: Reader,
      props: true
    },
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/thoughts',
      name: 'Thoughts',
      component: Thoughts,
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
