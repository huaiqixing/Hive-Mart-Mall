import request from '@/config/axios'
import type { Category } from '@/types'

export const getCategoryList = () => {
  return request.get<Category[]>({ url: '/product/category/list' })
}

export const getCategoryListByIds = (ids: number[]) => {
  return request.get<Category[]>({ url: '/product/category/list-by-ids', params: { ids: ids.join(',') } })
}
