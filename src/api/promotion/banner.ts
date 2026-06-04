import request from '@/config/axios'
import type { Banner } from '@/types'

export const getBannerList = (position: number) => {
  return request.get<Banner[]>({ url: '/promotion/banner/list', params: { position } })
}
