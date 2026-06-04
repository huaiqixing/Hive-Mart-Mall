import request from '@/config/axios'
import type { Address } from '@/types'

export const getAddressList = () => {
  return request.get<Address[]>({ url: '/member/address/list' })
}

export const getAddress = (id: number) => {
  return request.get<Address>({ url: '/member/address/get', params: { id } })
}

export const getDefaultAddress = () => {
  return request.get<Address>({ url: '/member/address/get-default' })
}

export const createAddress = (data: Address) => {
  return request.post({ url: '/member/address/create', data })
}

export const updateAddress = (data: Address) => {
  return request.put({ url: '/member/address/update', data })
}

export const deleteAddress = (id: number) => {
  return request.delete({ url: '/member/address/delete', params: { id } })
}
