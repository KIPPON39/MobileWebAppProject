import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import { auth } from '../firebase/config'
import { onAuthStateChanged } from 'firebase/auth'

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/tabs/map' },
  { path: '/login', component: () => import('../views/auth/LoginPage.vue') },
  { path: '/register', component: () => import('../views/auth/RegisterPage.vue') },
  {
    path: '/tabs',
    component: () => import('../views/TabsPage.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/tabs/map' },
      { path: 'map', component: () => import('../views/MapPage.vue') },
      { path: 'search', component: () => import('../views/SearchPage.vue') },
      { path: 'favorite', component: () => import('../views/FavoritePage.vue') },
      { path: 'profile', component: () => import('../views/ProfilePage.vue') }
    ]
  },
  {
    path: '/detail/:id',
    component: () => import('../views/DetailPage.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// มี timeout 5 วิ ป้องกัน hang บน Android
const getCurrentUser = (): Promise<import('firebase/auth').User | null> =>
  new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), 5000)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(timeout)
      unsubscribe()
      resolve(user)
    })
  })

router.beforeEach(async (to) => {
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  const user = await getCurrentUser()
  if (requiresAuth && !user) return '/login'
  if ((to.path === '/login' || to.path === '/register') && user) return '/tabs/map'
})

export default router
