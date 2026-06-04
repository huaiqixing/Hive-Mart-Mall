import request from '@/config/axios'
import type { MemberUser } from '@/types'

export const getUserInfo = () => {
  return request.get<MemberUser>({ url: '/member/user/get' })
}

export const updateUserInfo = (data: Partial<MemberUser>) => {
  return request.put({ url: '/member/user/update', data })
}

export const updateMobile = (data: { mobile: string; code: string }) => {
  return request.put({ url: '/member/user/update-mobile', data })
}

export const updatePassword = (data: { oldPassword: string; newPassword: string }) => {
  return request.put({ url: '/member/user/update-password', data })
}

export const resetPassword = (data: { mobile: string; code: string; password: string }) => {
  return request.put({ url: '/member/user/reset-password', data })
}
