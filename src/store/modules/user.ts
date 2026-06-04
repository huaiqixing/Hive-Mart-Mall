import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAccessToken, setToken, removeToken } from '@/utils/auth'
import * as AuthApi from '@/api/member/auth'
import * as UserApi from '@/api/member/user'
import type { MemberUser } from '@/types'

export const useUserStore = defineStore('mall-user', () => {
  const userInfo = ref<MemberUser | null>(null)
  const token = ref<string>(getAccessToken())
  const orderCount = ref<Record<string, number>>({})

  const isLogin = computed(() => !!token.value)

  async function loginByPassword(mobile: string, password: string) {
    const res = await AuthApi.loginByPassword({ mobile, password })
    setToken(res.accessToken, res.refreshToken)
    token.value = res.accessToken
    await getUserInfo()
  }

  async function register(account: string, password: string) {
    const res = await AuthApi.register({ account, password })
    setToken(res.accessToken, res.refreshToken)
    token.value = res.accessToken
    await getUserInfo()
  }

  async function loginBySms(mobile: string, code: string) {
    const res = await AuthApi.loginBySms({ mobile, code })
    setToken(res.accessToken, res.refreshToken)
    token.value = res.accessToken
    await getUserInfo()
  }

  async function getUserInfo() {
    const res = await UserApi.getUserInfo()
    userInfo.value = res
  }

  async function getOrderCount() {
    try {
      const res = await import('@/api/trade/order').then(m => m.getOrderCount())
      orderCount.value = res
    } catch (e) {
      // ignore
    }
  }

  async function logout() {
    try {
      await AuthApi.logout()
    } catch (e) {
      // ignore
    }
    removeToken()
    token.value = ''
    userInfo.value = null
    orderCount.value = {}
  }

  return {
    userInfo,
    token,
    orderCount,
    isLogin,
    loginByPassword,
    register,
    loginBySms,
    getUserInfo,
    getOrderCount,
    logout
  }
}, {
  persist: {
    pick: ['token']
  }
})
