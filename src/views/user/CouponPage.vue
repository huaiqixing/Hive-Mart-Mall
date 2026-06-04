<template>
  <div class="coupon-page">
    <h3 class="section-title">我的优惠券</h3>

    <!-- Status Tabs -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="未使用" name="1" />
      <el-tab-pane label="已使用" name="2" />
      <el-tab-pane label="已过期" name="3" />
    </el-tabs>

    <!-- Coupon List -->
    <div class="coupon-list" v-if="couponList.length > 0">
      <div v-for="coupon in couponList" :key="coupon.id" class="coupon-card">
        <div class="coupon-left" :class="couponStatusClass">
          <template v-if="coupon.discountType === 1">
            <span class="coupon-value">{{ coupon.discountPercent }}</span>
            <span class="coupon-unit">折</span>
          </template>
          <template v-else>
            <span class="coupon-symbol">¥</span>
            <span class="coupon-value">{{ coupon.discountPrice }}</span>
          </template>
        </div>
        <div class="coupon-right">
          <p class="coupon-name">{{ coupon.name }}</p>
          <p class="coupon-condition">满{{ coupon.usePrice }}元可用</p>
          <p class="coupon-period">
            {{ coupon.validStartTime }} ~ {{ coupon.validEndTime }}
          </p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <el-empty v-else-if="!loading" description="暂无优惠券" />

    <!-- Pagination -->
    <div class="pagination-wrap" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="pageNo"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="loadCoupons"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getCouponPage } from '@/api/promotion/coupon'
import type { Coupon } from '@/types'

const activeTab = ref('1')
const couponList = ref<Coupon[]>([])
const loading = ref(false)
const pageNo = ref(1)
const pageSize = 10
const total = ref(0)

const couponStatusClass = computed(() => {
  if (activeTab.value === '1') return 'status-active'
  if (activeTab.value === '2') return 'status-used'
  return 'status-expired'
})

async function loadCoupons() {
  loading.value = true
  try {
    const res = await getCouponPage({
      pageNo: pageNo.value,
      pageSize,
      status: Number(activeTab.value)
    })
    couponList.value = res.list
    total.value = res.total
  } catch {
    couponList.value = []
  } finally {
    loading.value = false
  }
}

function handleTabChange() {
  pageNo.value = 1
  loadCoupons()
}

onMounted(() => {
  loadCoupons()
})
</script>

<style scoped lang="scss">
.coupon-page {
  //
}

.section-title {
  font-size: $mall-font-size-lg;
  color: $mall-text-primary;
  font-weight: 600;
  margin: 0 0 $mall-spacing-md;
  padding-bottom: $mall-spacing-md;
  border-bottom: 1px solid $mall-border-color;
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: $mall-spacing-md;
}

.coupon-card {
  display: flex;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
  overflow: hidden;
  background: $mall-bg-white;
}

.coupon-left {
  width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: $mall-spacing-md;
  color: #fff;
  font-weight: 700;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    background: $mall-bg-white;
    border-radius: 50%;
    border-left: 1px solid $mall-border-color;
  }

  &.status-active {
    background: linear-gradient(135deg, $mall-primary, $mall-primary-light);
  }

  &.status-used {
    background: $mall-text-muted;
  }

  &.status-expired {
    background: $mall-info;
  }

  .coupon-symbol {
    font-size: $mall-font-size-lg;
    margin-right: 2px;
  }

  .coupon-value {
    font-size: 36px;
    line-height: 1;
  }

  .coupon-unit {
    font-size: $mall-font-size-lg;
    margin-left: 2px;
  }
}

.coupon-right {
  flex: 1;
  padding: $mall-spacing-md $mall-spacing-lg;
  min-width: 0;

  .coupon-name {
    font-size: $mall-font-size-lg;
    color: $mall-text-primary;
    font-weight: 600;
    margin: 0 0 $mall-spacing-sm;
  }

  .coupon-condition {
    font-size: $mall-font-size-sm;
    color: $mall-text-secondary;
    margin: 0 0 $mall-spacing-xs;
  }

  .coupon-period {
    font-size: $mall-font-size-xs;
    color: $mall-text-muted;
    margin: 0;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: $mall-spacing-lg 0;
}
</style>
