# CLAUDE.md - HiveMart PC 商城

## Project Overview

Vue3 + Element Plus PC 端电子商务商城前端，对接 Hive-Mart 后端的 `/app-api` 接口。

## Common Commands

```bash
pnpm dev              # 启动开发服务器 (port 3000)
pnpm build:prod       # 生产构建
pnpm ts:check         # TypeScript 类型检查
```

## Architecture

- **API 前缀**: `/app-api`（不是 `/admin-api`）
- **认证**: `/member/auth/*`（会员认证，不是系统管理员认证）
- **Token**: `MALL_ACCESS_TOKEN` / `MALL_REFRESH_TOKEN`
- **租户**: 请求头自动注入 `tenant-id`
- **路由**: 全部静态路由，`meta: { auth: true }` 控制需登录页面

## Key Files

- `src/config/axios/service.ts` - Axios 拦截器（Token 注入/刷新/401 处理）
- `src/utils/auth.ts` - Token 存取
- `src/store/modules/user.ts` - 用户登录态
- `src/store/modules/cart.ts` - 购物车状态
- `src/types/index.ts` - 全部 TypeScript 类型定义
- `src/router/routes/public.ts` - 路由定义

## Development Patterns

### API 调用
```typescript
import request from '@/config/axios'
const data = await request.get({ url: '/product/spu/page', params: { pageNo: 1 } })
```

### Store 使用
```typescript
const userStore = useUserStore()  // from @/store/modules/user
const cartStore = useCartStore()  // from @/store/modules/cart
```

## Style Conventions

- SCSS 变量在 `src/assets/styles/variables.scss`，通过 Vite `additionalData` 全局可用
- 主色 `$mall-primary: #e4393c`
- 内容最大宽度 `$mall-content-max-width: 1200px`
- 使用 `.container` 类实现居中布局
