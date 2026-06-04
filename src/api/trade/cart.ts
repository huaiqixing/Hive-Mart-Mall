import request from '@/config/axios'
import type { CartItem } from '@/types'

interface CartListResp {
  validList: CartItem[]
  invalidList: CartItem[]
}

export const addCart = (data: { skuId: number; count: number }) => {
  return request.post({ url: '/trade/cart/add', data })
}

export const getCartList = () => {
  return request.get<CartListResp>({ url: '/trade/cart/list' })
}

export const updateCartCount = (data: { id: number; count: number }) => {
  return request.put({ url: '/trade/cart/update-count', data })
}

export const updateCartSelected = (data: { ids: number[]; selected: boolean }) => {
  return request.put({ url: '/trade/cart/update-selected', data })
}

export const deleteCartItems = (ids: number[]) => {
  return request.delete({ url: '/trade/cart/delete', params: { ids: ids.join(',') } })
}

export const getCartCount = () => {
  return request.get<number>({ url: '/trade/cart/get-count' })
}
