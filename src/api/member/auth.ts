import request from '@/config/axios'
import type { AuthToken } from '@/types'

export const loginByPassword = (data: { mobile: string; password: string }) => {
  return request.post<AuthToken>({ url: '/member/auth/login', data })
}

export const register = (data: { account: string; password: string }) => {
  return request.post<AuthToken>({ url: '/member/auth/register', data })
}

export const loginBySms = (data: { mobile: string; code: string }) => {
  return request.post<AuthToken>({ url: '/member/auth/sms-login', data })
}

export const sendSmsCode = (mobile: string, scene: number = 1) => {
  return request.post({ url: '/member/auth/send-sms-code', data: { mobile, scene } })
}

export const logout = () => {
  return request.post({ url: '/member/auth/logout' })
}

export const socialLogin = (data: { type: number; code: string; state: string }) => {
  return request.post<AuthToken>({ url: '/member/auth/social-login', data })
}
