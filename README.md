# HiveMart PC 商城

基于 Vue3 + Element Plus + TypeScript 的 PC 端宽屏电子商务商城前端，后端对接 Hive-Mart（芋道框架）的 `/app-api` 接口。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5.x | Composition API + `<script setup>` |
| Vite | 5.1.x | 构建工具 |
| Element Plus | 2.11.x | UI 组件库（中文） |
| TypeScript | 5.3.x | 类型系统 |
| Pinia | 2.1.x | 状态管理（持久化） |
| Vue Router | 4.4.x | 路由管理 |
| Axios | 1.9.x | HTTP 请求 |
| SCSS | 1.69.x | 样式预处理 |

## 项目结构

```
Hive-Mart-Mall/
├── public/                     # 静态资源
├── src/
│   ├── api/                    # API 接口层
│   │   ├── member/             # 会员相关
│   │   │   ├── auth.ts         # 登录、登出、短信验证码
│   │   │   ├── user.ts         # 用户信息、修改资料
│   │   │   └── address.ts      # 收货地址 CRUD
│   │   ├── product/            # 商品相关
│   │   │   ├── spu.ts          # 商品列表、详情
│   │   │   ├── category.ts     # 商品分类
│   │   │   ├── favorite.ts     # 收藏/取消收藏
│   │   │   └── comment.ts      # 商品评价
│   │   ├── trade/              # 交易相关
│   │   │   ├── cart.ts         # 购物车
│   │   │   └── order.ts        # 订单（创建/列表/详情/取消/确认收货）
│   │   ├── promotion/          # 营销活动
│   │   │   ├── banner.ts       # 轮播图
│   │   │   └── coupon.ts       # 优惠券
│   │   ├── pay/
│   │   │   └── order.ts        # 支付
│   │   └── infra/
│   │       └── file.ts         # 文件上传
│   ├── assets/styles/          # 全局样式
│   │   ├── variables.scss      # SCSS 变量（颜色、间距、字体）
│   │   ├── reset.scss          # CSS 重置
│   │   ├── global.scss         # 全局工具类
│   │   └── index.scss          # 样式入口
│   ├── config/axios/           # HTTP 客户端配置
│   │   ├── config.ts           # 基础配置（baseURL、超时）
│   │   ├── service.ts          # Axios 实例 + 拦截器（Token 注入/刷新/401 处理）
│   │   └── index.ts            # 请求方法封装（get/post/put/delete/upload）
│   ├── hooks/                  # 组合式函数
│   ├── layout/                 # 布局组件
│   │   ├── MallLayout.vue      # 主布局（Header + Content + Footer）
│   │   └── components/
│   │       ├── MallHeader.vue  # 顶部导航（Logo + 搜索 + 用户 + 购物车）
│   │       └── MallFooter.vue  # 页脚
│   ├── router/                 # 路由配置
│   │   ├── index.ts            # 路由实例 + 守卫
│   │   └── routes/
│   │       └── public.ts       # 全部路由定义
│   ├── store/                  # Pinia 状态管理
│   │   ├── index.ts            # Pinia 初始化 + 持久化插件
│   │   └── modules/
│   │       ├── user.ts         # 用户状态（登录/登出/用户信息/订单统计）
│   │       ├── cart.ts         # 购物车状态（列表/选中/总价/操作）
│   │       └── app.ts          # 全局状态（分类缓存）
│   ├── types/                  # TypeScript 类型定义
│   │   └── index.ts            # 全部业务类型
│   ├── utils/                  # 工具函数
│   │   └── auth.ts             # Token 管理（存取/删除/租户ID）
│   └── views/                  # 页面组件
│       ├── home/               # 首页
│       ├── product/            # 商品列表 + 商品详情
│       ├── cart/               # 购物车
│       ├── order/              # 结算 + 订单列表 + 订单详情
│       ├── payment/            # 支付 + 支付结果
│       ├── auth/               # 登录
│       ├── user/               # 个人中心 + 资料 + 地址 + 收藏 + 优惠券
│       ├── search/             # 搜索
│       └── category/           # 分类浏览
├── .env                        # 环境变量（本地开发）
├── .env.dev                    # 开发环境
├── .env.prod                   # 生产环境
├── index.html                  # HTML 入口
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 快速开始

### 前置条件

- Node.js >= 16.0.0
- pnpm >= 8.6.0
- Hive-Mart 后端运行在 `localhost:48080`

### 安装与启动

```bash
cd Hive-Mart-Mall

# 安装依赖
pnpm install

# 启动开发服务器（默认端口 3000）
pnpm dev

# 启动并连接开发环境后端
pnpm dev-server
```

### 构建

```bash
pnpm build:local    # 本地环境构建
pnpm build:dev      # 开发环境构建
pnpm build:prod     # 生产环境构建
```

### 预览

```bash
pnpm preview
```

### 类型检查

```bash
pnpm ts:check
```

## 页面路由

### 公开页面（无需登录）

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | Banner 轮播、分类入口、推荐商品 |
| `/product/list` | 商品列表 | 分类筛选、排序、分页 |
| `/product/:id` | 商品详情 | 图片画廊、SKU 选择、加购/购买 |
| `/category` | 分类浏览 | 左侧分类树 + 右侧商品网格 |
| `/search` | 搜索 | 关键词搜索、排序、分页 |
| `/login` | 登录 | 密码登录 / 短信验证码登录 |

### 需要登录的页面

| 路由 | 页面 | 说明 |
|------|------|------|
| `/cart` | 购物车 | 商品列表、数量调整、全选、结算 |
| `/checkout` | 确认订单 | 地址选择、配送方式、优惠券、提交订单 |
| `/order/list` | 订单列表 | 按状态筛选（全部/待付款/待发货/已发货/已完成） |
| `/order/:id` | 订单详情 | 订单状态流程、物流追踪、操作按钮 |
| `/payment/:id` | 支付 | 选择支付方式（支付宝/微信/余额） |
| `/payment/result` | 支付结果 | 支付成功/失败展示 |
| `/user` | 个人中心 | 左侧菜单 + 右侧内容 |
| `/user/address` | 收货地址 | 地址列表、新增/编辑/删除 |
| `/user/favorite` | 我的收藏 | 收藏商品列表 |
| `/user/coupon` | 我的优惠券 | 未使用/已使用/已过期 |

## 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `VITE_BASE_URL` | `http://localhost:48080` | 后端地址 |
| `VITE_API_URL` | `/app-api` | API 前缀（商城端用 app-api，管理后台用 admin-api） |
| `VITE_TENANT_ID` | `1` | 租户 ID |
| `VITE_PORT` | `3000` | 开发服务器端口 |
| `VITE_UPLOAD_TYPE` | `server` | 上传方式（server=后端上传） |

## 核心架构

### 认证机制

商城使用**会员认证**（区别于管理后台的系统认证）：

- 登录接口：`/app-api/member/auth/login`（密码）或 `/sms-login`（验证码）
- Token 存储：`MALL_ACCESS_TOKEN` / `MALL_REFRESH_TOKEN`（localStorage）
- 自动刷新：401 时自动调用 `/member/auth/refresh-token` 刷新令牌
- 请求头：自动注入 `Authorization: Bearer <token>` 和 `tenant-id`

### 请求封装

```typescript
import request from '@/config/axios'

// GET 请求
const data = await request.get({ url: '/product/spu/page', params: { pageNo: 1 } })

// POST 请求
await request.post({ url: '/trade/cart/add', data: { skuId: 1, count: 2 } })

// 文件上传
await request.upload({ url: '/infra/file/upload', data: formData })
```

### 状态管理

```typescript
// 用户状态
const userStore = useUserStore()
await userStore.loginByPassword('13800138000', 'password')
console.log(userStore.isLogin, userStore.userInfo)

// 购物车状态
const cartStore = useCartStore()
await cartStore.getList()
console.log(cartStore.totalPrice, cartStore.selectedItems)
```

### 布局结构

```
+------------------------------------------------------------------+
|  MallHeader（fixed, h=60px）                                      |
|  [Logo] [搜索栏........................] [用户菜单] [购物车徽标]    |
+------------------------------------------------------------------+
|                                                                    |
|  <router-view /> 主内容区（max-width: 1200px, 居中）               |
|                                                                    |
+------------------------------------------------------------------+
|  MallFooter（深色背景）                                            |
|  购物指南 | 配送方式 | 售后服务 | 关于我们                          |
+------------------------------------------------------------------+
```

### 样式变量

主要 SCSS 变量定义在 `src/assets/styles/variables.scss`：

```scss
$mall-primary: #e4393c;        // 主色（红色）
$mall-price-color: #e4393c;    // 价格颜色
$mall-text-primary: #333;      // 主文字
$mall-text-secondary: #666;    // 次文字
$mall-text-muted: #999;        // 弱文字
$mall-bg-gray: #f5f5f5;        // 页面背景
$mall-content-max-width: 1200px; // 内容最大宽度
```

## 后端 API 对接

项目对接 Hive-Mart 后端的 `/app-api` 前缀接口，关键 API 模块：

| 模块 | 接口前缀 | 说明 |
|------|----------|------|
| 会员认证 | `/member/auth` | 登录、登出、刷新令牌 |
| 会员信息 | `/member/user` | 获取/修改用户信息 |
| 收货地址 | `/member/address` | 地址 CRUD |
| 商品 | `/product/spu` | 商品分页、详情 |
| 分类 | `/product/category` | 分类列表 |
| 收藏 | `/product/favorite` | 收藏/取消 |
| 评价 | `/product/comment` | 评价列表、创建 |
| 购物车 | `/trade/cart` | 增删改查 |
| 订单 | `/trade/order` | 创建、列表、详情、取消、确认收货 |
| 轮播图 | `/promotion/banner` | Banner 列表 |
| 优惠券 | `/promotion/coupon` | 领取、我的优惠券 |
| 支付 | `/pay/order` | 创建支付单 |
| 文件 | `/infra/file` | 文件上传 |

## 开发指南

### 新增 API

在 `src/api/` 对应目录下创建文件：

```typescript
// src/api/promotion/seckill.ts
import request from '@/config/axios'

export const getSeckillPage = (params: any) => {
  return request.get({ url: '/promotion/seckill-activity/page', params })
}
```

### 新增页面

1. 在 `src/views/` 下创建 Vue 组件
2. 在 `src/router/routes/public.ts` 添加路由
3. 如需登录，设置 `meta: { auth: true }`

### 新增 Store

在 `src/store/modules/` 下创建：

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useXxxStore = defineStore('mall-xxx', () => {
  const data = ref()
  // ... actions
  return { data }
}, { persist: { pick: ['data'] } })
```

## 与管理后台的区别

| 对比项 | 管理后台 (Hive-Mart-UI) | 商城前端 (Hive-Mart-Mall) |
|--------|------------------------|--------------------------|
| API 前缀 | `/admin-api` | `/app-api` |
| 认证方式 | 系统管理员 (`/system/auth`) | 会员用户 (`/member/auth`) |
| Token 键名 | `ACCESS_TOKEN` | `MALL_ACCESS_TOKEN` |
| 路由模式 | 动态路由（后端权限） | 静态路由 |
| 布局风格 | 管理后台（侧边栏 + 标签页） | 电商商城（顶部导航 + 内容区） |
| 端口 | 5173 | 3000 |

## 浏览器支持

- Chrome >= 80
- Firefox >= 80
- Safari >= 14
- Edge >= 80

## License

MIT
