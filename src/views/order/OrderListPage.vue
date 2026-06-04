<template>
  <div class="order-list-page">
      <h2 class="page-title">我的订单</h2>

      <!-- Status Tabs -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane name="0">
          <template #label>
            待付款 <el-badge v-if="orderCount['0']" :value="orderCount['0']" class="tab-badge" />
          </template>
        </el-tab-pane>
        <el-tab-pane label="已完成" name="30" />
        <el-tab-pane label="已关闭" name="50" />
      </el-tabs>

      <!-- Order List -->
      <div class="order-list" v-if="orderList.length > 0">
        <div v-for="order in orderList" :key="order.id" class="order-card">
          <!-- Order Header -->
          <div class="order-header">
            <div class="order-meta">
              <span class="order-no">订单号: {{ order.no }}</span>
              <span class="order-time">{{ formatDate(order.createTime) }}</span>
            </div>
            <el-tag
              :type="getStatusTagType(order.status)"
              size="small"
            >
              {{ OrderStatus[order.status as keyof typeof OrderStatus] || '未知' }}
            </el-tag>
          </div>

          <!-- Order Items -->
          <div class="order-items">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="order-product-wrap"
            >
              <div class="order-product">
                <el-image class="product-img" :src="item.picUrl" fit="cover" />
                <div class="product-info">
                  <p class="product-name ellipsis-2">{{ item.spuName }}</p>
                  <p class="product-specs" v-if="item.skuName">{{ item.skuName }}</p>
                </div>
                <div class="product-price">
                  <span class="price">{{ fenToYuan(item.price) }}</span>
                </div>
                <div class="product-count">x{{ item.count }}</div>
              </div>
              <div v-if="item.homeUrl" class="task-info">
                <span class="task-tag">主页链接</span>
                <span class="task-val">{{ item.homeUrl }}</span>
                <span class="task-tag">时长</span>
                <span class="task-val">{{ item.duration }}小时</span>
                <span class="task-tag">方式</span>
                <span class="task-val">{{ {1:'立即执行',2:'定时执行',3:'每天执行'}[item.taskExecMode || 1] }}</span>
                <template v-if="item.taskExecMode === 3 && item.execDays">
                  <span class="task-tag">天数</span>
                  <span class="task-val">{{ item.execDays }}天</span>
                </template>
              </div>
            </div>
          </div>

          <!-- Order Footer -->
          <div class="order-footer">
            <div class="order-total">
              共 {{ order.productCount }} 件商品 合计:
              <span class="price pay-price">{{ fenToYuan(order.payPrice) }}</span>
              <span class="freight">（含运费 ¥{{ fenToYuan(order.freightPrice) }}）</span>
            </div>
            <div class="order-actions">
              <!-- 待付款 -->
              <template v-if="order.status === 0">
                <el-button type="primary" size="small" @click="handlePay(order)">
                  去付款
                </el-button>
                <el-button size="small" @click="handleCancel(order.id)">取消订单</el-button>
              </template>
              <!-- 已完成 -->
              <template v-if="order.status === 30">
                <el-button size="small" @click="handleRebuy(order)">再次购买</el-button>
              </template>
              <!-- 已关闭 -->
              <template v-if="order.status === 50">
                <el-button size="small" @click="handleDeleteOrder(order.id)">
                  删除订单
                </el-button>
              </template>
              <el-button size="small" link @click="handleViewDetail(order.id)">
                查看详情
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <el-empty v-else-if="!loading" description="暂无相关订单" />

      <!-- Pagination -->
      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="pageNo"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="loadOrders"
        />
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderPage, cancelOrder, deleteOrder, getOrderCount } from '@/api/trade/order'
import { useUserStore } from '@/store/modules/user'
import { useCartStore } from '@/store/modules/cart'
import { OrderStatus } from '@/types'
import type { TradeOrder } from '@/types'
import { fenToYuan } from '@/utils/price'
import { formatDate } from '@/utils/date'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const activeTab = ref('all')
const orderList = ref<TradeOrder[]>([])
const loading = ref(false)
const pageNo = ref(1)
const pageSize = 10
const total = ref(0)
const orderCount = ref<Record<string, number>>({})

function getStatusTagType(status: number): '' | 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<number, '' | 'success' | 'warning' | 'danger' | 'info'> = {
    0: 'danger',
    10: 'warning',
    20: '',
    30: 'success',
    40: 'info',
    50: 'info'
  }
  return map[status] || 'info'
}

async function loadOrders() {
  loading.value = true
  try {
    const params: any = {
      pageNo: pageNo.value,
      pageSize
    }
    if (activeTab.value !== 'all') {
      params.status = Number(activeTab.value)
    }
    const res = await getOrderPage(params)
    orderList.value = res.list
    total.value = res.total
  } catch {
    orderList.value = []
  } finally {
    loading.value = false
  }
}

async function loadOrderCount() {
  try {
    const res = await getOrderCount()
    orderCount.value = res
    userStore.orderCount = res
  } catch {
    // ignore
  }
}

function handleTabChange() {
  pageNo.value = 1
  loadOrders()
}

function handlePay(order: TradeOrder) {
  router.push(`/payment/${order.id}`)
}

async function handleCancel(orderId: number) {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await cancelOrder(orderId)
    ElMessage.success('订单已取消')
    loadOrders()
    loadOrderCount()
  } catch {
    // cancelled
  }
}

async function handleRebuy(order: TradeOrder) {
  // Add items back to cart
  try {
    for (const item of order.items) {
      await cartStore.addItem(item.skuId, item.count)
    }
    ElMessage.success('商品已加入购物车')
    router.push('/cart')
  } catch {
    ElMessage.error('加入购物车失败')
  }
}

async function handleDeleteOrder(orderId: number) {
  try {
    await ElMessageBox.confirm('确定要删除该订单吗？删除后不可恢复', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteOrder(orderId)
    ElMessage.success('订单已删除')
    loadOrders()
  } catch {
    // cancelled
  }
}

function handleViewDetail(orderId: number) {
  router.push(`/user/order/${orderId}`)
}

onMounted(() => {
  loadOrders()
  loadOrderCount()
})
</script>

<style scoped lang="scss">
.order-list-page {
  min-height: 60vh;
}

.page-title {
  font-size: $mall-font-size-xl;
  color: $mall-text-primary;
  font-weight: 600;
  margin-bottom: $mall-spacing-md;
}

.tab-badge {
  margin-left: 4px;

  :deep(.el-badge__content) {
    top: -4px;
  }
}

.order-list {
  margin-top: $mall-spacing-md;
}

.order-card {
  background: $mall-bg-white;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
  margin-bottom: $mall-spacing-md;
  overflow: hidden;
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $mall-spacing-md $mall-spacing-lg;
  background: $mall-bg-gray;
  border-bottom: 1px solid $mall-border-color;

  .order-meta {
    display: flex;
    gap: $mall-spacing-lg;

    .order-no {
      font-size: $mall-font-size-sm;
      color: $mall-text-secondary;
    }

    .order-time {
      font-size: $mall-font-size-sm;
      color: $mall-text-muted;
    }
  }
}

.order-items {
  padding: $mall-spacing-md $mall-spacing-lg;
}

.order-product-wrap {
  &:not(:last-child) {
    border-bottom: 1px solid $mall-border-color;
  }
}

.order-product {
  display: flex;
  align-items: center;
  gap: $mall-spacing-md;
  padding: $mall-spacing-sm 0;
}

.task-info {
  padding-bottom: $mall-spacing-sm;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $mall-spacing-xs;
  font-size: $mall-font-size-sm;

  .task-tag {
    background: $mall-bg-gray;
    color: $mall-text-secondary;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .task-val {
    color: $mall-text-primary;
    margin-right: $mall-spacing-md;
  }
}

.product-img {
  width: 80px;
  height: 80px;
  border-radius: $mall-radius-md;
  flex-shrink: 0;
  border: 1px solid $mall-border-color;
}

.product-info {
  flex: 1;
  min-width: 0;

  .product-name {
    font-size: $mall-font-size-base;
    color: $mall-text-primary;
    margin-bottom: $mall-spacing-xs;
  }

  .product-specs {
    font-size: $mall-font-size-xs;
    color: $mall-text-muted;
  }
}

.product-price {
  width: 100px;
  text-align: center;
  flex-shrink: 0;
}

.product-count {
  width: 60px;
  text-align: center;
  color: $mall-text-secondary;
  flex-shrink: 0;
}

.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $mall-spacing-md $mall-spacing-lg;
  border-top: 1px solid $mall-border-color;

  .order-total {
    font-size: $mall-font-size-sm;
    color: $mall-text-secondary;

    .pay-price {
      font-size: $mall-font-size-lg;
    }

    .freight {
      font-size: $mall-font-size-xs;
      color: $mall-text-muted;
    }
  }

  .order-actions {
    display: flex;
    align-items: center;
    gap: $mall-spacing-sm;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: $mall-spacing-lg 0;
}
</style>
