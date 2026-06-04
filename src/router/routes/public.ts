import type { RouteRecordRaw } from 'vue-router'
import MallLayout from '@/layout/MallLayout.vue'

const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MallLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/home/HomePage.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'product/list',
        name: 'ProductList',
        component: () => import('@/views/product/ProductListPage.vue'),
        meta: { title: '商品列表' }
      },
      {
        path: 'product/:id',
        name: 'ProductDetail',
        component: () => import('@/views/product/ProductDetailPage.vue'),
        meta: { title: '商品详情' }
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('@/views/category/CategoryPage.vue'),
        meta: { title: '分类' }
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('@/views/search/SearchPage.vue'),
        meta: { title: '搜索' }
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/LoginPage.vue'),
        meta: { title: '登录', noAuth: true }
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () => import('@/views/cart/CartPage.vue'),
        meta: { title: '购物车', auth: true }
      },
      {
        path: 'checkout',
        name: 'Checkout',
        component: () => import('@/views/order/CheckoutPage.vue'),
        meta: { title: '确认订单', auth: true }
      },
      {
        path: 'payment/:id',
        name: 'Payment',
        component: () => import('@/views/payment/PaymentPage.vue'),
        meta: { title: '支付', auth: true }
      },
      {
        path: 'payment/result',
        name: 'PaymentResult',
        component: () => import('@/views/payment/PaymentResultPage.vue'),
        meta: { title: '支付结果', auth: true }
      },
      {
        path: 'user',
        name: 'UserCenter',
        component: () => import('@/views/user/UserCenterPage.vue'),
        meta: { title: '个人中心', auth: true },
        children: [
          {
            path: '',
            name: 'UserProfile',
            component: () => import('@/views/user/ProfilePage.vue'),
            meta: { title: '个人资料', auth: true }
          },
          {
            path: 'address',
            name: 'AddressList',
            component: () => import('@/views/user/AddressListPage.vue'),
            meta: { title: '收货地址', auth: true }
          },
          {
            path: 'order/list',
            name: 'OrderList',
            component: () => import('@/views/order/OrderListPage.vue'),
            meta: { title: '我的订单', auth: true }
          },
          {
            path: 'order/:id',
            name: 'OrderDetail',
            component: () => import('@/views/order/OrderDetailPage.vue'),
            meta: { title: '订单详情', auth: true }
          },
          {
            path: 'password',
            name: 'ChangePassword',
            component: () => import('@/views/user/PasswordPage.vue'),
            meta: { title: '修改密码', auth: true }
          },
          {
            path: 'favorite',
            name: 'Favorite',
            component: () => import('@/views/user/FavoritePage.vue'),
            meta: { title: '我的收藏', auth: true }
          },
          {
            path: 'coupon',
            name: 'MyCoupon',
            component: () => import('@/views/user/CouponPage.vue'),
            meta: { title: '我的优惠券', auth: true }
          }
        ]
      }
    ]
  }
]

export default publicRoutes
