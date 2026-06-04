import request from '@/config/axios'
import type { Wallet } from '@/types'

export const getWallet = () => {
  return request.get<Wallet>({ url: '/pay/wallet/get' })
}
