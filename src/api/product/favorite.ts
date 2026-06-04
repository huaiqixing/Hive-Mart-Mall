import request from '@/config/axios'
import type { PageParam, PageResult, ProductSpu } from '@/types'

export const createFavorite = (spuId: number) => {
  return request.post({ url: '/product/favorite/create', data: { spuId } })
}

export const deleteFavorite = (spuId: number) => {
  return request.delete({ url: '/product/favorite/delete', data: { spuId } })
}

export const getFavoritePage = (params: PageParam) => {
  return request.get<PageResult<ProductSpu>>({ url: '/product/favorite/page', params })
}

export const checkFavorite = (spuId: number) => {
  return request.get<boolean>({ url: '/product/favorite/exits', params: { spuId } })
}
