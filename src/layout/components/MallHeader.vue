<template>
  <header class="mall-header">
    <div class="header-inner container">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <span class="logo-text">{{ configStore.mallName }}</span>
      </router-link>

      <!-- Search Bar -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索商品"
          size="large"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>

      <!-- Right Actions -->
      <div class="header-actions">
        <!-- Balance -->
        <div v-if="userStore.isLogin" class="action-item balance-display">
          <span class="balance-label">余额</span>
          <span class="balance-value">{{ wallet ? fenToYuan(wallet.balance) : '0.00' }}</span>
          <span class="balance-unit">元</span>
        </div>

        <!-- Cart -->
        <router-link to="/cart" class="action-item cart-action">
          <el-badge :value="cartCount" :hidden="cartCount === 0" :max="99">
            <el-icon :size="22"><ShoppingCart /></el-icon>
          </el-badge>
          <span>购物车</span>
        </router-link>

        <!-- User -->
        <div v-if="userStore.isLogin" class="user-dropdown">
          <el-dropdown trigger="hover">
            <span class="action-item">
              <el-avatar :size="28" :src="userStore.userInfo?.avatar" />
              <span class="username">{{ userStore.userInfo?.nickname || '用户' }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>
                  积分: {{ userStore.userInfo?.point || 0 }}
                </el-dropdown-item>
                <el-dropdown-item divided @click="$router.push('/user')">个人中心</el-dropdown-item>
                <el-dropdown-item @click="$router.push('/user/order/list')">我的订单</el-dropdown-item>
                <el-dropdown-item @click="$router.push('/user/favorite')">我的收藏</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div v-else class="auth-links">
          <router-link to="/login" class="action-item">登录</router-link>
          <router-link to="/login" class="action-item register">注册</router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ShoppingCart } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { useCartStore } from '@/store/modules/cart'
import { useConfigStore } from '@/store/modules/config'
import { getWallet } from '@/api/pay/wallet'
import type { Wallet } from '@/types'
import { fenToYuan } from '@/utils/price'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const configStore = useConfigStore()

const searchKeyword = ref('')

// 钱包余额
const wallet = ref<Wallet | null>(null)

const cartCount = computed(() => cartStore.totalCount)

// 获取钱包余额
const fetchWallet = async () => {
  if (!userStore.isLogin) return
  try {
    wallet.value = await getWallet()
  } catch (e) {
    console.error('获取钱包余额失败', e)
  }
}

function handleSearch() {
  const keyword = searchKeyword.value.trim()
  if (keyword) {
    router.push({ path: '/product/list', query: { keyword } })
  }
}

async function handleLogout() {
  await userStore.logout()
  router.push('/')
}

onMounted(async () => {
  await fetchWallet()
})
</script>

<style scoped lang="scss">
.mall-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: $mall-header-height;
  background: $mall-header-bg;
  box-shadow: $mall-shadow-sm;
}
.header-inner {
  display: flex;
  align-items: center;
  height: 100%;
  gap: $mall-spacing-lg;
}
.logo {
  flex-shrink: 0;
  text-decoration: none;
}
.logo-text {
  font-size: 24px;
  font-weight: bold;
  color: $mall-primary;
}
.search-bar {
  flex: 1;
  max-width: 500px;
  margin: 0 auto;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: $mall-spacing-lg;
  flex-shrink: 0;
}
.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: $mall-text-primary;
  font-size: $mall-font-size-sm;
  text-decoration: none;
  white-space: nowrap;
  &:hover {
    color: $mall-primary;
  }
}
.cart-action {
  position: relative;
}
.balance-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 4px 12px;
  background: rgba($mall-primary, 0.08);
  border-radius: $mall-radius-sm;

  .balance-label {
    font-size: $mall-font-size-sm;
    color: $mall-text-secondary;
  }

  .balance-value {
    font-size: $mall-font-size-lg;
    color: $mall-primary;
    font-weight: 600;
  }

  .balance-unit {
    font-size: $mall-font-size-xs;
    color: $mall-text-secondary;
  }
}
.username {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.auth-links {
  display: flex;
  gap: $mall-spacing-md;
}
.register {
  color: $mall-primary;
}
.user-dropdown {
  cursor: pointer;
}
</style>
