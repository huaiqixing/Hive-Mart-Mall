// API response wrapper
export interface ApiResult<T = any> {
  code: number
  data: T
  msg: string
}

// Pagination
export interface PageParam {
  pageNo?: number
  pageSize?: number
}

export interface PageResult<T = any> {
  list: T[]
  total: number
}

// Member user
export interface MemberUser {
  id: number
  nickname: string
  avatar: string
  mobile: string
  gender: number
  birthday: string
  point: number
  createTime: string
}

// Wallet
export interface Wallet {
  balance: number
  totalExpense: number
  totalRecharge: number
}

// Auth token
export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresTime: number
}

// Address
export interface Address {
  id?: number
  name: string
  mobile: string
  areaId: number
  areaName?: string
  detailAddress: string
  defaultStatus?: boolean
}

// Product SPU
export interface ProductSpu {
  id: number
  spuId?: number
  spuName?: string
  name: string
  categoryId: number
  keyword: string
  picUrl: string
  sliderPicUrls: string[]
  introduction: string
  price: number
  marketPrice: number
  costPrice: number
  salesCount: number
  stock: number
  status: number
  skus: ProductSku[]
  specList?: SpecGroup[]
  description?: string
  categoryName?: string
}

export interface ProductSku {
  id: number
  name: string
  price: number
  stock: number
  picUrl: string
  properties: SkuProperty[]
  firstBrokeragePrice?: number
  secondBrokeragePrice?: number
}

export interface SkuProperty {
  propertyId: number
  propertyName: string
  valueId: number
  valueName: string
}

export interface SpecGroup {
  id: number
  name: string
  values: { id: number; name: string }[]
}

// Category
export interface Category {
  id: number
  name: string
  picUrl: string
  parentId: number
  sort: number
  children?: Category[]
}

// Banner
export interface Banner {
  id: number
  title: string
  picUrl: string
  url: string
  sort: number
  position: number
}

// Cart
export interface CartItem {
  id: number
  skuId: number
  spuId: number
  count: number
  selected: boolean
  sku: ProductSku
  spu: {
    id: number
    name: string
    picUrl: string
    price: number
    deliveryTypes?: number[]
  }
}

// Order
export interface TradeOrder {
  id: number
  no: string
  status: number
  productCount: number
  totalPrice: number
  payPrice: number
  freightPrice: number
  couponPrice: number
  pointPrice: number
  payOrderId: number
  createTime: string
  payTime?: string
  deliveryTime?: string
  receiveTime?: string
  items: TradeOrderItem[]
  receiverName?: string
  receiverMobile?: string
  receiverAreaName?: string
  receiverDetailAddress?: string
  deliveryType?: number
}

export interface TradeOrderItem {
  id: number
  skuId: number
  spuId: number
  spuName: string
  skuName: string
  picUrl: string
  count: number
  price: number
  payPrice: number
  commentStatus: boolean
  afterSaleStatus: number
  homeUrl?: string
  duration?: number
  taskExecMode?: number
  scheduledTime?: string
  execDays?: number
  comments?: string
}

// Order settlement
export interface OrderSettlement {
  address: Address
  items: CartItem[]
  coupons: Coupon[]
  deliveryTypes: { type: number; name: string; price: number }[]
  freightPrice: number
  discountPrice: number
  couponPrice: number
  pointPrice: number
  payPrice: number
}

// Coupon
export interface Coupon {
  id: number
  templateId: number
  name: string
  status: number
  usePrice: number
  discountType: number
  discountPercent?: number
  discountPrice?: number
  validStartTime: string
  validEndTime: string
  useOrderId?: number
  useTime?: string
}

// Comment
export interface ProductComment {
  id: number
  userId: number
  userNickname: string
  userAvatar: string
  spuId: number
  skuId: number
  descriptionScores: number
  benefitScores: number
  content: string
  picUrls: string[]
  createTime: string
}

// Order status enum
export const OrderStatus = {
  0: '待付款',
  10: '待发货',
  20: '已发货',
  30: '已完成',
  40: '已取消',
  50: '已关闭'
} as const

// Delivery type enum
export const DeliveryType = {
  EXPRESS: 1,
  PICK_UP: 2
} as const
