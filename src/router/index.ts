import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import { getAccessToken } from '@/utils/auth'
import { useUserStore } from '@/store/modules/user'
import { useConfigStore } from '@/store/modules/config'
import publicRoutes from './routes/public'

const router = createRouter({
  history: createWebHistory(),
  routes: publicRoutes,
  scrollBehavior: () => ({ top: 0 })
})

const loginRoute = '/login'

router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  const configStore = useConfigStore()
  await configStore.loadConfig()
  const name = configStore.mallName
  document.title = to.meta.title ? `${to.meta.title} - ${name} 商城` : `${name} 商城`

  const token = getAccessToken()
  const needAuth = to.matched.some(r => r.meta.auth === true)

  if (needAuth && !token) {
    next({ path: loginRoute, query: { redirect: to.fullPath } })
  } else if (to.path === loginRoute && token) {
    next({ path: '/' })
  } else {
    // Load user info if authenticated but not loaded yet
    if (token) {
      const userStore = useUserStore()
      if (!userStore.userInfo) {
        try {
          await userStore.getUserInfo()
        } catch (e) {
          // token invalid, will be handled by axios interceptor
        }
      }
    }
    next()
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
