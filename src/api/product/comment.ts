import request from '@/config/axios'
import type { PageParam, PageResult, ProductComment } from '@/types'

export const getCommentPage = (params: PageParam & { spuId?: number; type?: number }) => {
  return request.get<PageResult<ProductComment>>({ url: '/product/comment/page', params })
}

export const createComment = (data: { orderItemId: number; spuId: number; descriptionScores: number; benefitScores: number; content: string; picUrls: string[] }) => {
  return request.post({ url: '/product/comment/create', data })
}
