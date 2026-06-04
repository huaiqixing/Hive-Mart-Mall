import request from '@/config/axios'

export const createPayOrder = (data: { id: number; channelId?: number }) => {
  return request.post<{ orderId: number; payOrderNo: string }>({ url: '/pay/order/create', data })
}

export const submitPayOrder = (data: { id: number; channelCode: string }) => {
  return request.post({ url: '/pay/order/submit', data })
}
