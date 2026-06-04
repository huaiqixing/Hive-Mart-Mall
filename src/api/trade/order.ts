import request from '@/config/axios'
import type { PageParam, PageResult, TradeOrder, OrderSettlement } from '@/types'

export const getOrderSettlement = (data: { items: { skuId: number; count: number }[] }) => {
  return request.post<OrderSettlement>({ url: '/trade/order/settlement', data })
}

export const createOrder = (data: {
  items: { skuId: number; count: number; cartId?: number; homeUrl?: string; duration?: number; taskExecMode?: number; scheduledTime?: string; execDays?: number; comments?: string[] }[]
  addressId?: number
  couponId?: number
  deliveryType?: number
  remark?: string
  pointStatus?: boolean
}) => {
  return request.post<{ id: number; payOrderId: number }>({ url: '/trade/order/create', data })
}

export const getOrderPage = (params: PageParam & { status?: number }) => {
  return request.get<PageResult<TradeOrder>>({ url: '/trade/order/page', params })
}

export const getOrderDetail = (id: number) => {
  return request.get<TradeOrder>({ url: '/trade/order/get-detail', params: { id } })
}

export const getOrderCount = () => {
  return request.get<Record<string, number>>({ url: '/trade/order/get-count' })
}

export const receiveOrder = (id: number) => {
  return request.put({ url: '/trade/order/receive', params: { id } })
}

export const cancelOrder = (id: number) => {
  return request.delete({ url: '/trade/order/cancel', params: { id } })
}

export const deleteOrder = (id: number) => {
  return request.delete({ url: '/trade/order/delete', params: { id } })
}

export const getExpressTrackList = (id: number) => {
  return request.get<any[]>({ url: '/trade/order/get-express-track-list', params: { id } })
}
