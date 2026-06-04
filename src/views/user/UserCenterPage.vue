<template>
  <div class="user-center-page">
    <div class="container">
      <div class="user-center-layout">
        <!-- Left Sidebar -->
        <aside class="user-sidebar">
          <div class="sidebar-user" v-if="userStore.userInfo">
            <el-avatar :size="64" :src="userStore.userInfo.avatar" />
            <p class="sidebar-nickname">{{ userStore.userInfo.nickname || '用户' }}</p>
            <p class="sidebar-mobile">{{ userStore.userInfo.mobile || '' }}</p>
            <!-- User Stats -->
            <div class="sidebar-stats">
              <div class="stat-item">
                <div class="stat-label">余额</div>
                <div class="stat-value">{{ walletLoading ? '--' : (wallet ? fenToYuan(wallet.balance) : '0.00') }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">积分</div>
                <div class="stat-value">{{ userStore.userInfo.point || 0 }}</div>
              </div>
            </div>
          </div>
          <el-menu
            :default-active="activeMenu"
            router
            class="sidebar-menu"
          >
            <el-menu-item index="/user">
              <el-icon><User /></el-icon>
              <span>个人资料</span>
            </el-menu-item>
            <el-menu-item index="/user/address">
              <el-icon><Location /></el-icon>
              <span>收货地址</span>
            </el-menu-item>
            <el-menu-item index="/user/order/list">
              <el-icon><List /></el-icon>
              <span>我的订单</span>
            </el-menu-item>
            <el-menu-item index="/user/favorite">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
            <el-menu-item index="/user/password">
              <el-icon><Lock /></el-icon>
              <span>修改密码</span>
            </el-menu-item>
            <el-menu-item index="/user/coupon">
              <el-icon><Ticket /></el-icon>
              <span>我的优惠券</span>
            </el-menu-item>
          </el-menu>
        </aside>

        <!-- Right Content -->
        <main class="user-content">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { User, Location, List, Star, Lock, Ticket } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { getWallet } from '@/api/pay/wallet'
import type { Wallet } from '@/types'
import { fenToYuan } from '@/utils/price'

const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => {
  if (route.path.startsWith('/user/order')) return '/user/order/list'
  return route.path
})

// 钱包余额
const wallet = ref<Wallet | null>(null)
const walletLoading = ref(false)

// 获取钱包余额
const fetchWallet = async () => {
  if (!userStore.isLogin) return
  walletLoading.value = true
  try {
    wallet.value = await getWallet()
  } catch (e) {
    console.error('获取钱包余额失败', e)
  } finally {
    walletLoading.value = false
  }
}

// 刷新用户信息（获取最新积分和余额）
onMounted(async () => {
  if (userStore.isLogin) {
    await userStore.getUserInfo()
    await fetchWallet()
  }
})
</script>

<style scoped lang="scss">
.user-center-page {
  padding: $mall-spacing-lg 0 $mall-spacing-xl;
  min-height: 60vh;
}

.user-center-layout {
  display: flex;
  gap: $mall-spacing-lg;
  align-items: flex-start;
}

.user-sidebar {
  width: 200px;
  flex-shrink: 0;
  background: $mall-bg-white;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
  overflow: hidden;
}

.sidebar-user {
  text-align: center;
  padding: $mall-spacing-lg $mall-spacing-md;
  border-bottom: 1px solid $mall-border-color;

  .sidebar-nickname {
    margin: $mall-spacing-sm 0 0;
    font-size: $mall-font-size-base;
    color: $mall-text-primary;
    font-weight: 500;
  }

  .sidebar-mobile {
    font-size: $mall-font-size-sm;
    color: $mall-text-secondary;
    margin: $mall-spacing-xs 0;
  }

  .sidebar-stats {
    display: flex;
    gap: $mall-spacing-md;
    padding: $mall-spacing-sm 0;
    margin-top: $mall-spacing-sm;
    border-top: 1px solid $mall-border-color;

    .stat-item {
      flex: 1;
      text-align: center;

      .stat-label {
        font-size: $mall-font-size-xs;
        color: $mall-text-secondary;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: $mall-font-size-lg;
        color: $mall-primary;
        font-weight: 600;
      }
    }
  }
}

.sidebar-menu {
  border-right: none;

  :deep(.el-menu-item) {
    height: 48px;
    line-height: 48px;

    &.is-active {
      color: $mall-primary;
      background: rgba($mall-primary, 0.05);
    }
  }
}

.user-content {
  flex: 1;
  min-width: 0;
  background: $mall-bg-white;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
  padding: $mall-spacing-lg;
}
</style>
