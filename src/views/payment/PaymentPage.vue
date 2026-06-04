<template>
  <div class="payment-page">
    <div class="container">
      <div class="payment-card">
        <h2 class="page-title">订单支付</h2>

        <!-- Order Summary -->
        <div class="order-summary" v-if="order">
          <div class="summary-row">
            <span class="label">订单编号:</span>
            <span class="value">{{ order.no }}</span>
          </div>
          <div class="summary-row">
            <span class="label">商品数量:</span>
            <span class="value">{{ order.productCount }} 件</span>
          </div>
          <div class="summary-row">
            <span class="label">商品名称:</span>
            <span class="value">{{ order.items[0]?.spuName || '' }}</span>
          </div>
        </div>

        <!-- Payment Amount -->
        <div class="payment-amount">
          <span class="amount-label">应付金额:</span>
          <span class="amount-value">
            <small>¥</small>{{ payAmount }}
          </span>
        </div>

        <!-- Payment Methods -->
        <div class="payment-methods">
          <h3 class="method-title">支付方式</h3>
          <div class="method-card active">
            <div class="method-content">
              <span class="method-icon balance">余</span>
              <span class="method-name">余额支付</span>
            </div>
          </div>
        </div>

        <!-- Pay Button -->
        <div class="payment-action">
          <el-button
            type="primary"
            size="large"
            class="pay-btn"
            :loading="payLoading"
            @click="handlePay"
          >
            立即支付
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOrderDetail } from '@/api/trade/order'
import { submitPayOrder } from '@/api/pay/order'
import type { TradeOrder } from '@/types'
import { fenToYuan } from '@/utils/price'

const router = useRouter()
const route = useRoute()

const order = ref<TradeOrder | null>(null)
const payLoading = ref(false)

const orderId = computed(() => Number(route.params.id))

const payAmount = computed(() => {
  if (!order.value) return '0.00'
  return fenToYuan(order.value.payPrice)
})

async function loadOrder() {
  try {
    order.value = await getOrderDetail(orderId.value)
  } catch {
    ElMessage.error('获取订单信息失败')
    router.back()
  }
}

async function handlePay() {
  if (!order.value?.payOrderId) {
    ElMessage.error('支付单不存在')
    return
  }
  payLoading.value = true
  try {
    await submitPayOrder({
      id: order.value.payOrderId,
      channelCode: 'wallet'
    })
    ElMessage.success('支付成功')
    router.push(`/payment/result?orderId=${orderId.value}`)
  } catch (e: any) {
    // 拦截器已弹出后端错误提示
  } finally {
    payLoading.value = false
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
.payment-page {
  padding: $mall-spacing-xl 0;
  min-height: 60vh;
}

.payment-card {
  max-width: 700px;
  margin: 0 auto;
  background: $mall-bg-white;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-lg;
  padding: $mall-spacing-xl;
}

.page-title {
  font-size: $mall-font-size-xl;
  color: $mall-text-primary;
  font-weight: 600;
  margin: 0 0 $mall-spacing-lg;
  padding-bottom: $mall-spacing-md;
  border-bottom: 1px solid $mall-border-color;
}

.order-summary {
  margin-bottom: $mall-spacing-lg;

  .summary-row {
    display: flex;
    align-items: center;
    padding: $mall-spacing-xs 0;

    .label {
      width: 80px;
      color: $mall-text-muted;
      font-size: $mall-font-size-sm;
      flex-shrink: 0;
    }

    .value {
      color: $mall-text-primary;
      font-size: $mall-font-size-base;
    }
  }
}

.payment-amount {
  text-align: center;
  padding: $mall-spacing-lg;
  margin-bottom: $mall-spacing-lg;
  background: $mall-bg-gray;
  border-radius: $mall-radius-md;

  .amount-label {
    font-size: $mall-font-size-lg;
    color: $mall-text-secondary;
  }

  .amount-value {
    display: block;
    margin-top: $mall-spacing-sm;
    color: $mall-price-color;
    font-size: 36px;
    font-weight: 700;

    small {
      font-size: $mall-font-size-lg;
    }
  }
}

.method-title {
  font-size: $mall-font-size-lg;
  color: $mall-text-primary;
  font-weight: 600;
  margin: 0 0 $mall-spacing-md;
}

.method-group {
  display: flex;
  flex-direction: column;
  gap: $mall-spacing-md;
  width: 100%;
}

.method-card {
  margin: 0 !important;
  padding: $mall-spacing-md;
  border: 2px solid $mall-border-color;
  border-radius: $mall-radius-md;
  transition: border-color 0.2s;

  &:hover {
    border-color: $mall-primary-light;
  }

  &.is-active {
    border-color: $mall-primary;
    background: rgba($mall-primary, 0.02);
  }
}

.method-content {
  display: flex;
  align-items: center;
  gap: $mall-spacing-md;
}

.method-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: $mall-radius-md;
  font-size: $mall-font-size-lg;
  font-weight: 700;
  color: #fff;

  &.balance {
    background: $mall-warning;
  }
}

.method-name {
  font-size: $mall-font-size-lg;
  color: $mall-text-primary;
}

.payment-action {
  margin-top: $mall-spacing-xl;
  text-align: center;
}

.pay-btn {
  width: 300px;
  height: 50px;
  font-size: $mall-font-size-lg;
}
</style>
