import request from '@/config/axios'
import type { PageParam, PageResult, ProductSpu } from '@/types'

export const getSpuPage = (params: PageParam & { categoryId?: number; keyword?: string; sortField?: string; sortAsc?: boolean }) => {
  return request.get<PageResult<ProductSpu>>({ url: '/product/spu/page', params })
}

export const getSpuDetail = (id: number) => {
  return request.get<ProductSpu>({ url: '/product/spu/get-detail', params: { id } })
}

export const getSpuListByIds = (ids: number[]) => {
  return request.get<ProductSpu[]>({ url: '/product/spu/list-by-ids', params: { ids: ids.join(',') } })
}
