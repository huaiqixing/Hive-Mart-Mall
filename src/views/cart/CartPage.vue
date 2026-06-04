<template>
  <div class="cart-page">
    <div class="container">
      <!-- Page Title -->
      <div class="page-header">
        <h2>我的购物车 <span class="cart-count">({{ cartStore.totalCount }}件商品)</span></h2>
      </div>

      <!-- Empty State -->
      <div v-if="cartStore.validItems.length === 0 && !cartStore.loading" class="empty-cart">
        <el-empty description="购物车还是空的哦~">
          <template #image>
            <el-icon :size="120" color="#ddd"><ShoppingCart /></el-icon>
          </template>
          <el-button type="primary" size="large" @click="router.push('/')">去逛逛</el-button>
        </el-empty>
      </div>

      <!-- Cart Content -->
      <template v-else>
        <div class="cart-content">
          <!-- Cart Table Header -->
          <div class="cart-table-header">
            <div class="col-check">选择</div>
            <div class="col-product">商品信息</div>
            <div class="col-price">单价</div>
            <div class="col-quantity">数量</div>
            <div class="col-subtotal">小计</div>
            <div class="col-action">操作</div>
          </div>

          <!-- Cart Items -->
          <div class="cart-items">
            <div
              v-for="item in cartStore.validItems"
              :key="item.id"
              class="cart-item"
              :class="{ 'item-invalid': item.sku.stock !== -1 && item.sku.stock <= 0 }"
            >
              <div class="cart-item-row">
                <div class="col-check">
                  <el-checkbox
                    :model-value="item.selected"
                    @change="(val: boolean) => handleSelectChange(item.id, val)"
                  />
                </div>
                <div class="col-product">
                  <router-link :to="`/product/${item.spuId}`" class="product-info">
                    <el-image
                      class="product-img"
                      :src="item.spu.picUrl"
                      fit="cover"
                    />
                    <div class="product-text">
                      <p class="product-name ellipsis-2">{{ item.spu.name }}</p>
                      <p class="product-specs" v-if="item.sku.properties?.length">
                        {{ item.sku.properties.map(p => p.valueName).join(' / ') }}
                      </p>
                    </div>
                  </router-link>
                </div>
                <div class="col-price">
                  <span class="price">{{ fenToYuan(item.sku.price) }}</span>
                </div>
                <div class="col-quantity">
                  <el-input-number
                    :model-value="item.count"
                    :min="1"
                    :max="item.sku.stock === -1 ? 9999 : (item.sku.stock || 999)"
                    size="small"
                    @change="(val: number) => handleCountChange(item.id, val)"
                  />
                </div>
                <div class="col-subtotal">
                  <span class="subtotal price">{{ fenToYuan(item.sku.price * item.count) }}</span>
                </div>
                <div class="col-action">
                  <el-button
                    type="danger"
                    :icon="Delete"
                    link
                    @click="handleDelete(item.id)"
                  />
                </div>
              </div>
              <!-- Task Parameters -->
              <div class="task-fields">
                <div class="task-field-row">
                  <span class="task-label">主页链接</span>
                  <el-input
                    :model-value="getTaskForm(item.sku.id).homeUrl"
                    @update:model-value="(val: string) => updateTaskField(item.sku.id, 'homeUrl', val)"
                    placeholder="请输入主页链接"
                    size="small"
                    class="task-input"
                  />
                </div>
                <div class="task-field-row">
                  <span class="task-label">任务时长</span>
                  <el-input-number
                    :model-value="getTaskForm(item.sku.id).duration"
                    @update:model-value="(val: number) => updateTaskField(item.sku.id, 'duration', val)"
                    :min="1"
                    size="small"
                  />
                  <span class="task-unit">小时</span>
                </div>
                <div class="task-field-row">
                  <span class="task-label">执行方式</span>
                  <el-radio-group
                    :model-value="getTaskForm(item.sku.id).taskExecMode"
                    @update:model-value="(val: number) => updateTaskField(item.sku.id, 'taskExecMode', val)"
                    size="small"
                  >
                    <el-radio :value="1">立即执行</el-radio>
                    <el-radio :value="2">定时执行</el-radio>
                    <el-radio :value="3">每天执行</el-radio>
                  </el-radio-group>
                </div>
                <div class="task-field-row" v-if="getTaskForm(item.sku.id).taskExecMode === 2">
                  <span class="task-label">执行时间</span>
                  <el-date-picker
                    :model-value="getTaskForm(item.sku.id).scheduledTime"
                    @update:model-value="(val: string) => updateTaskField(item.sku.id, 'scheduledTime', val)"
                    type="datetime"
                    placeholder="请选择执行时间"
                    :disabled-date="d => d.getTime() < Date.now() - 86400000"
                    value-format="YYYY-MM-DDTHH:mm:ss"
                    size="small"
                  />
                </div>
                <div class="task-field-row" v-if="getTaskForm(item.sku.id).taskExecMode === 3">
                  <span class="task-label">开始时间</span>
                  <el-date-picker
                    :model-value="getTaskForm(item.sku.id).scheduledTime"
                    @update:model-value="(val: string) => updateTaskField(item.sku.id, 'scheduledTime', val)"
                    type="datetime"
                    placeholder="请选择每天开始执行的时间"
                    :disabled-date="d => d.getTime() < Date.now() - 86400000"
                    value-format="YYYY-MM-DDTHH:mm:ss"
                    size="small"
                  />
                </div>
                <div class="task-field-row" v-if="getTaskForm(item.sku.id).taskExecMode === 3">
                  <span class="task-label">执行天数</span>
                  <el-input-number
                    :model-value="getTaskForm(item.sku.id).execDays"
                    @update:model-value="(val: number) => updateTaskField(item.sku.id, 'execDays', val)"
                    :min="1"
                    :max="365"
                    size="small"
                  />
                  <span class="task-unit">天</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="cart-bottom-bar">
          <div class="bottom-left">
            <el-checkbox
              :model-value="isAllSelected"
              :indeterminate="isIndeterminate"
              @change="handleSelectAll"
            >
              全选
            </el-checkbox>
            <el-button
              type="danger"
              plain
              :disabled="selectedIds.length === 0"
              @click="handleDeleteSelected"
            >
              删除选中
            </el-button>
          </div>
          <div class="bottom-right">
            <span class="selected-info">已选 <em>{{ cartStore.selectedCount }}</em> 件商品</span>
            <span class="total-price">
              合计: <em class="price">{{ fenToYuan(cartStore.totalPrice) }}</em>
            </span>
            <el-button
              type="primary"
              size="large"
              :disabled="cartStore.selectedCount === 0"
              @click="handleCheckout"
            >
              去结算
            </el-button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, ShoppingCart } from '@element-plus/icons-vue'
import { useCartStore } from '@/store/modules/cart'
import type { TaskForm } from '@/store/modules/cart'
import { useUserStore } from '@/store/modules/user'
import { fenToYuan } from '@/utils/price'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const isAllSelected = computed(() => {
  const items = cartStore.validItems
  return items.length > 0 && items.every(item => item.selected)
})

const isIndeterminate = computed(() => {
  const items = cartStore.validItems
  const selectedCount = items.filter(item => item.selected).length
  return selectedCount > 0 && selectedCount < items.length
})

const selectedIds = computed(() =>
  cartStore.selectedItems.map(item => item.id)
)

function getTaskForm(skuId: number): TaskForm {
  return cartStore.getTaskParams(skuId)
}

function updateTaskField(skuId: number, field: keyof TaskForm, value: any) {
  const form = cartStore.getTaskParams(skuId)
  ;(form as any)[field] = value
  cartStore.setTaskParams(skuId, form)
}

async function handleSelectChange(id: number, selected: boolean) {
  try {
    await cartStore.updateSelected(id, selected)
  } catch {
    ElMessage.error('操作失败，请重试')
  }
}

async function handleSelectAll(val: boolean) {
  try {
    await cartStore.updateAllSelected(val)
  } catch {
    ElMessage.error('操作失败，请重试')
  }
}

async function handleCountChange(id: number, count: number) {
  if (count < 1) return
  try {
    await cartStore.updateCount(id, count)
  } catch {
    ElMessage.error('修改数量失败')
  }
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await cartStore.deleteItems([id])
    ElMessage.success('已删除')
  } catch {
    // cancelled
  }
}

async function handleDeleteSelected() {
  if (selectedIds.value.length === 0) return
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 件商品吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await cartStore.deleteItems(selectedIds.value)
    ElMessage.success('已删除')
  } catch {
    // cancelled
  }
}

function handleCheckout() {
  if (cartStore.selectedCount === 0) {
    ElMessage.warning('请先选择商品')
    return
  }
  // Validate task params for selected items
  for (const item of cartStore.selectedItems) {
    const task = cartStore.getTaskParams(item.sku.id)
    if (!task.homeUrl.trim()) {
      ElMessage.warning(`请填写「${item.spu.name}」的主页链接`)
      return
    }
    if ((task.taskExecMode === 2 || task.taskExecMode === 3) && !task.scheduledTime) {
      ElMessage.warning(`请选择「${item.spu.name}」的执行时间`)
      return
    }
    if (task.taskExecMode === 3 && (!task.execDays || task.execDays < 1)) {
      ElMessage.warning(`请填写「${item.spu.name}」的执行天数`)
      return
    }
  }
  router.push('/checkout')
}

onMounted(() => {
  if (userStore.isLogin) {
    cartStore.getList()
  }
})
</script>

<style scoped lang="scss">
.cart-page {
  padding: $mall-spacing-lg 0 $mall-spacing-xl;
  min-height: 60vh;
}

.page-header {
  margin-bottom: $mall-spacing-lg;

  h2 {
    font-size: $mall-font-size-xl;
    color: $mall-text-primary;
    font-weight: 600;
  }
  .cart-count {
    font-size: $mall-font-size-base;
    color: $mall-text-muted;
    font-weight: normal;
  }
}

.empty-cart {
  padding: $mall-spacing-xl * 2 0;
  text-align: center;
}

.cart-content {
  background: $mall-bg-white;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
}

.cart-table-header {
  display: flex;
  align-items: center;
  padding: $mall-spacing-md $mall-spacing-lg;
  background: $mall-bg-gray;
  border-bottom: 1px solid $mall-border-color;
  font-size: $mall-font-size-sm;
  color: $mall-text-secondary;
}

.cart-items {
  .cart-item {
    padding: $mall-spacing-lg;
    border-bottom: 1px solid $mall-border-color;

    &:last-child {
      border-bottom: none;
    }

    &.item-invalid {
      opacity: 0.5;
    }
  }
}

.cart-item-row {
  display: flex;
  align-items: center;
}

.task-fields {
  margin-left: 50px;
  margin-top: $mall-spacing-md;
  padding-top: $mall-spacing-md;
  border-top: 1px dashed $mall-border-color;
}

.task-field-row {
  display: flex;
  align-items: center;
  margin-bottom: $mall-spacing-sm;

  &:last-child {
    margin-bottom: 0;
  }
}

.task-label {
  width: 70px;
  flex-shrink: 0;
  font-size: $mall-font-size-sm;
  color: $mall-text-secondary;
}

.task-unit {
  margin-left: $mall-spacing-xs;
  font-size: $mall-font-size-sm;
  color: $mall-text-muted;
}

.task-input {
  max-width: 300px;
}

.col-check {
  width: 50px;
  flex-shrink: 0;
}

.col-product {
  flex: 1;
  min-width: 0;
}

.col-price {
  width: 120px;
  text-align: center;
  flex-shrink: 0;
}

.col-quantity {
  width: 140px;
  text-align: center;
  flex-shrink: 0;
}

.col-subtotal {
  width: 120px;
  text-align: center;
  flex-shrink: 0;
}

.col-action {
  width: 80px;
  text-align: center;
  flex-shrink: 0;
}

.product-info {
  display: flex;
  gap: $mall-spacing-md;
  text-decoration: none;
  color: inherit;
}

.product-img {
  width: 80px;
  height: 80px;
  border-radius: $mall-radius-md;
  flex-shrink: 0;
  border: 1px solid $mall-border-color;
}

.product-text {
  flex: 1;
  min-width: 0;

  .product-name {
    font-size: $mall-font-size-base;
    color: $mall-text-primary;
    line-height: 1.5;
    margin-bottom: $mall-spacing-xs;
  }

  .product-specs {
    font-size: $mall-font-size-xs;
    color: $mall-text-muted;
  }
}

.subtotal {
  font-weight: 700;
  font-size: $mall-font-size-lg;
}

.cart-bottom-bar {
  position: sticky;
  bottom: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $mall-spacing-md $mall-spacing-lg;
  background: $mall-bg-white;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
  margin-top: $mall-spacing-md;
  box-shadow: $mall-shadow-md;
}

.bottom-left {
  display: flex;
  align-items: center;
  gap: $mall-spacing-lg;
}

.bottom-right {
  display: flex;
  align-items: center;
  gap: $mall-spacing-lg;

  .selected-info {
    font-size: $mall-font-size-base;
    color: $mall-text-secondary;

    em {
      font-style: normal;
      color: $mall-primary;
      font-weight: 600;
    }
  }

  .total-price {
    font-size: $mall-font-size-base;
    color: $mall-text-primary;

    em {
      font-style: normal;
      font-size: $mall-font-size-xl;
    }
  }
}
</style>
