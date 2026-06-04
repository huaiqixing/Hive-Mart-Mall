<template>
  <div class="payment-result-page">
    <div class="container">
      <div class="result-card">
        <el-icon class="success-icon" :size="80"><CircleCheckFilled /></el-icon>
        <h2 class="result-title">支付成功</h2>
        <div class="result-info" v-if="orderId">
          <p>订单编号: {{ orderId }}</p>
        </div>
        <div class="result-actions">
          <el-button type="primary" size="large" @click="router.push(`/user/order/${orderId}`)">
            查看订单
          </el-button>
          <el-button size="large" @click="router.push('/')">
            继续购物
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CircleCheckFilled } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const orderId = computed(() => route.query.orderId as string || '')
</script>

<style scoped lang="scss">
.payment-result-page {
  padding: $mall-spacing-xl * 2 0;
  min-height: 60vh;
}

.result-card {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
  background: $mall-bg-white;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-lg;
  padding: $mall-spacing-xl * 2 $mall-spacing-xl;
}

.success-icon {
  color: $mall-success;
  margin-bottom: $mall-spacing-lg;
}

.result-title {
  font-size: $mall-font-size-xl;
  color: $mall-text-primary;
  font-weight: 600;
  margin: 0 0 $mall-spacing-md;
}

.result-info {
  color: $mall-text-secondary;
  font-size: $mall-font-size-base;
  margin-bottom: $mall-spacing-lg;

  p {
    margin: $mall-spacing-xs 0;
  }
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: $mall-spacing-lg;
  margin-top: $mall-spacing-lg;
}
</style>
