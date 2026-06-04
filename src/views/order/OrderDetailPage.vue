<template>
  <div class="order-detail-page">
      <div class="page-back">
        <el-button link @click="router.back()">
          <el-icon><ArrowLeft /></el-icon> 返回订单列表
        </el-button>
      </div>

      <template v-if="order">
        <!-- Order Status Steps -->
        <div class="status-bar">
          <el-steps :active="stepActive" align-center finish-status="success">
            <el-step title="提交订单" :description="formatDate(order.createTime)" />
            <el-step title="付款成功" :description="formatDate(order.payTime)" />
            <el-step title="交易完成" :description="formatDate(order.finishTime)" />
          </el-steps>
        </div>

        <!-- Order Info -->
        <div class="detail-section">
          <div class="section-header">
            <h3>订单信息</h3>
            <el-tag :type="getStatusTagType(order.status)" size="large">
              {{ OrderStatus[order.status as keyof typeof OrderStatus] || '未知' }}
            </el-tag>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">订单编号:</span>
              <span class="value">{{ order.no }}</span>
            </div>
            <div class="info-item">
              <span class="label">下单时间:</span>
              <span class="value">{{ formatDate(order.createTime) }}</span>
            </div>
            <div class="info-item" v-if="order.payTime">
              <span class="label">付款时间:</span>
              <span class="value">{{ formatDate(order.payTime) }}</span>
            </div>
          </div>
        </div>

        <!-- Receiver Info (虚拟商品不显示) -->
        <div class="detail-section" v-if="order.deliveryType !== 3">
          <div class="section-header">
            <h3>收货信息</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">收货人:</span>
              <span class="value">{{ order.receiverName }}</span>
            </div>
            <div class="info-item">
              <span class="label">联系电话:</span>
              <span class="value">{{ order.receiverMobile }}</span>
            </div>
            <div class="info-item">
              <span class="label">收货地址:</span>
              <span class="value">{{ order.receiverAreaName }} {{ order.receiverDetailAddress }}</span>
            </div>
          </div>
        </div>

        <!-- Product Items -->
        <div class="detail-section">
          <div class="section-header">
            <h3>商品信息</h3>
          </div>
          <div class="product-list">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="product-row-wrap"
            >
              <div class="product-row">
                <el-image class="product-img" :src="item.picUrl" fit="cover" />
                <div class="product-info">
                  <router-link :to="`/product/${item.spuId}`" class="product-name ellipsis-2">
                    {{ item.spuName }}
                  </router-link>
                  <p class="product-specs" v-if="item.skuName">{{ item.skuName }}</p>
                </div>
                <div class="product-price">
                  <span class="price">{{ fenToYuan(item.price) }}</span>
                </div>
                <div class="product-count">x{{ item.count }}</div>
                <div class="product-subtotal">
                  <span class="price">{{ fenToYuan(item.price * item.count) }}</span>
                </div>
              </div>
              <!-- Task Parameters -->
              <div v-if="item.homeUrl" class="task-info">
                <span class="task-tag">主页链接</span>
                <span class="task-val">{{ item.homeUrl }}</span>
                <span class="task-tag">时长</span>
                <span class="task-val">{{ item.duration }}小时</span>
                <span class="task-tag">执行方式</span>
                <span class="task-val">{{ {1:'立即执行',2:'定时执行',3:'每天执行'}[item.taskExecMode || 1] }}</span>
                <template v-if="item.taskExecMode === 2 && item.scheduledTime">
                  <span class="task-tag">执行时间</span>
                  <span class="task-val">{{ item.scheduledTime }}</span>
                </template>
                <template v-if="item.taskExecMode === 3">
                  <span class="task-tag" v-if="item.scheduledTime">开始时间</span>
                  <span class="task-val" v-if="item.scheduledTime">{{ item.scheduledTime }}</span>
                  <span class="task-tag">执行天数</span>
                  <span class="task-val">{{ item.execDays }}天</span>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Price Breakdown -->
        <div class="detail-section">
          <div class="section-header">
            <h3>费用明细</h3>
          </div>
          <div class="price-breakdown">
            <div class="price-row">
              <span>商品总价</span>
              <span>¥{{ fenToYuan(order.totalPrice) }}</span>
            </div>
            <div class="price-row">
              <span>运费</span>
              <span>¥{{ fenToYuan(order.freightPrice) }}</span>
            </div>
            <div class="price-row" v-if="order.couponPrice > 0">
              <span>优惠</span>
              <span class="discount">-¥{{ fenToYuan(order.couponPrice) }}</span>
            </div>
            <div class="price-row" v-if="order.pointPrice > 0">
              <span>积分抵扣</span>
              <span class="discount">-¥{{ fenToYuan(order.pointPrice) }}</span>
            </div>
            <div class="price-row total">
              <span>实付金额</span>
              <span class="pay-amount">¥{{ fenToYuan(order.payPrice) }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="detail-actions" v-if="hasActions">
          <template v-if="order.status === 0">
            <el-button type="primary" size="large" @click="handlePay">去付款</el-button>
            <el-button size="large" @click="handleCancel">取消订单</el-button>
          </template>
          <template v-if="order.status === 30">
            <el-button size="large" @click="handleRebuy">再次购买</el-button>
          </template>
          <template v-if="order.status === 50">
            <el-button size="large" @click="handleDelete">删除订单</el-button>
          </template>
        </div>
      </template>

      <!-- Loading -->
      <div v-else-if="loading" class="loading-wrap">
        <el-skeleton :rows="10" animated />
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import {
  getOrderDetail,
  cancelOrder,
  deleteOrder
} from '@/api/trade/order'
import { useCartStore } from '@/store/modules/cart'
import { OrderStatus } from '@/types'
import type { TradeOrder } from '@/types'
import { fenToYuan } from '@/utils/price'
import { formatDate } from '@/utils/date'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

const order = ref<TradeOrder | null>(null)
const loading = ref(false)

const orderId = computed(() => Number(route.params.id))

const stepActive = computed(() => {
  if (!order.value) return 0
  const s = order.value.status
  if (s === 0) return 1
  if (s === 30) return 3
  if (s === 40 || s === 50) return 0
  return 0
})

const hasActions = computed(() => {
  if (!order.value) return false
  return [0, 30, 50].includes(order.value.status)
})

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

async function loadOrder() {
  loading.value = true
  try {
    order.value = await getOrderDetail(orderId.value)
  } catch {
    ElMessage.error('获取订单详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

function handlePay() {
  router.push(`/payment/${orderId.value}`)
}

async function handleCancel() {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await cancelOrder(orderId.value)
    ElMessage.success('订单已取消')
    loadOrder()
  } catch {
    // cancelled
  }
}

async function handleRebuy() {
  if (!order.value) return
  try {
    for (const item of order.value.items) {
      await cartStore.addItem(item.skuId, item.count)
    }
    ElMessage.success('商品已加入购物车')
    router.push('/cart')
  } catch {
    ElMessage.error('加入购物车失败')
  }
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm('确定要删除该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteOrder(orderId.value)
    ElMessage.success('订单已删除')
    router.push('/user/order/list')
  } catch {
    // cancelled
  }
}

onMounted(() => {
  if (orderId.value) {
    loadOrder()
  } else {
    router.replace('/user/order/list')
  }
})
</script>

<style scoped lang="scss">
.order-detail-page {
  min-height: 60vh;
}

.page-back {
  margin-bottom: $mall-spacing-md;
}

.status-bar {
  background: $mall-bg-white;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
  padding: $mall-spacing-xl $mall-spacing-lg;
  margin-bottom: $mall-spacing-md;
}

.detail-section {
  background: $mall-bg-white;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
  padding: $mall-spacing-lg;
  margin-bottom: $mall-spacing-md;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $mall-spacing-md;
    padding-bottom: $mall-spacing-md;
    border-bottom: 1px solid $mall-border-color;

    h3 {
      font-size: $mall-font-size-lg;
      color: $mall-text-primary;
      font-weight: 600;
      margin: 0;
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $mall-spacing-md;

  .info-item {
    .label {
      color: $mall-text-muted;
      font-size: $mall-font-size-sm;
      margin-right: $mall-spacing-sm;
    }
    .value {
      color: $mall-text-primary;
      font-size: $mall-font-size-base;
    }
  }
}

// Products
.product-row-wrap {
  border-bottom: 1px solid $mall-border-color;

  &:last-child {
    border-bottom: none;
  }
}

.product-row {
  display: flex;
  align-items: center;
  gap: $mall-spacing-md;
  padding: $mall-spacing-md 0;
}

.task-info {
  padding: $mall-spacing-sm 0 $mall-spacing-md;
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
    text-decoration: none;
    display: block;
    margin-bottom: $mall-spacing-xs;

    &:hover {
      color: $mall-primary;
    }
  }

  .product-specs {
    font-size: $mall-font-size-xs;
    color: $mall-text-muted;
    margin: 0;
  }
}

.product-price,
.product-count,
.product-subtotal {
  flex-shrink: 0;
  text-align: center;
  width: 100px;
}

.product-count {
  width: 60px;
  color: $mall-text-secondary;
}

// Logistics
.logistics-timeline {
  padding: $mall-spacing-sm 0;

  :deep(.el-timeline-item__timestamp) {
    color: $mall-text-muted;
  }
}

// Price Breakdown
.price-breakdown {
  max-width: 400px;
  margin-left: auto;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: $mall-spacing-sm 0;
  font-size: $mall-font-size-base;
  color: $mall-text-secondary;

  .discount {
    color: $mall-success;
  }

  &.total {
    padding-top: $mall-spacing-md;
    margin-top: $mall-spacing-sm;
    border-top: 1px solid $mall-border-color;
    font-size: $mall-font-size-lg;
    color: $mall-text-primary;
    font-weight: 600;

    .pay-amount {
      color: $mall-price-color;
      font-size: $mall-font-size-xl;
      font-weight: 700;
    }
  }
}

// Actions
.detail-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $mall-spacing-md;
  padding: $mall-spacing-xl;
  background: $mall-bg-white;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
}

.loading-wrap {
  padding: $mall-spacing-xl;
  background: $mall-bg-white;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
}
</style>
