import request from '@/config/axios'
import type { PageParam, PageResult, Coupon } from '@/types'

export const takeCoupon = (templateId: number) => {
  return request.post({ url: '/promotion/coupon/take', data: { templateId } })
}

export const getCouponPage = (params: PageParam & { status?: number }) => {
  return request.get<PageResult<Coupon>>({ url: '/promotion/coupon/page', params })
}

export const getUnusedCouponCount = () => {
  return request.get<number>({ url: '/promotion/coupon/get-unused-count' })
}
