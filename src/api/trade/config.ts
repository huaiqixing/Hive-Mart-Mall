import request from '@/config/axios'

export interface TradeConfig {
  mallName: string
  deliveryPickUpEnabled: boolean
}

export const getTradeConfig = () => {
  return request.get<TradeConfig>({ url: '/trade/config/get' })
}
