<template>
  <div class="checkout-page">
    <div class="container">
      <div class="checkout-layout">
        <!-- Left: Main Content -->
        <div class="checkout-main">
          <h2 class="page-title">确认订单</h2>

          <!-- Step 1: Address (hidden for virtual-only goods) -->
          <section v-if="!cartStore.allVirtual" class="checkout-section">
            <div class="section-header">
              <h3>收货地址</h3>
              <el-button type="primary" link @click="showAddressDialog = true">
                + 新增收货地址
              </el-button>
            </div>
            <div class="address-list" v-if="addressList.length > 0">
              <div
                v-for="addr in addressList"
                :key="addr.id"
                class="address-card"
                :class="{ active: selectedAddressId === addr.id }"
                @click="selectedAddressId = addr.id!"
              >
                <div class="address-info">
                  <span class="name">{{ addr.name }}</span>
                  <span class="mobile">{{ addr.mobile }}</span>
                  <el-tag v-if="addr.defaultStatus" size="small" type="danger">默认</el-tag>
                </div>
                <div class="address-detail">{{ addr.areaName }} {{ addr.detailAddress }}</div>
                <div v-if="selectedAddressId === addr.id" class="address-check">
                  <el-icon><Check /></el-icon>
                </div>
              </div>
            </div>
            <p v-else class="no-address-tip">未添加收货地址，订单将以自提方式提交</p>
          </section>

          <!-- Step 2: Product List + Task Params -->
          <section class="checkout-section">
            <div class="section-header">
              <h3>商品清单</h3>
            </div>
              <div class="product-list">
              <div
                v-for="(item, index) in cartStore.selectedItems"
                :key="item.id"
                class="product-block"
              >
                <div class="product-item">
                  <el-image class="product-img" :src="item.spu.picUrl" fit="cover" />
                  <div class="product-info">
                    <p class="product-name ellipsis-2">{{ item.spu.name }}</p>
                    <p class="product-specs" v-if="item.sku.properties?.length">
                      {{ item.sku.properties.map(p => p.valueName).join(' / ') }}
                    </p>
                  </div>
                  <div class="product-price">
                    <span class="price">{{ fenToYuan(item.sku.price) }}</span>
                  </div>
                  <div class="product-count">x{{ item.count }}</div>
                  <div class="product-subtotal">
                    <span class="price">{{ fenToYuan(item.sku.price * item.count) }}</span>
                  </div>
                </div>
                <!-- Task Parameters (flat layout) -->
                <div class="task-fields">
                  <el-form :model="taskForms[index]" :rules="taskRules" :ref="el => taskFormRefs[index] = el" class="task-form" label-width="80px">
                    <el-form-item label="主页链接" prop="homeUrl">
                      <el-input v-model="taskForms[index].homeUrl" placeholder="请输入直播间主页链接" />
                    </el-form-item>
                    <el-form-item label="任务时长" prop="duration">
                      <el-input-number v-model="taskForms[index].duration" :min="1" />
                      <span class="ml-2 text-gray-400">小时</span>
                    </el-form-item>
                    <el-form-item label="执行方式" prop="taskExecMode">
                      <el-radio-group v-model="taskForms[index].taskExecMode">
                        <el-radio :value="1">立即执行</el-radio>
                        <el-radio :value="2">定时执行</el-radio>
                        <el-radio :value="3">每天执行</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item v-if="taskForms[index].taskExecMode === 2" label="执行时间" prop="scheduledTime">
                      <el-date-picker
                        v-model="taskForms[index].scheduledTime"
                        type="datetime"
                        placeholder="请选择执行时间"
                        :disabled-date="d => d.getTime() < Date.now() - 86400000"
                        value-format="YYYY-MM-DDTHH:mm:ss"
                      />
                    </el-form-item>
                    <el-form-item v-if="taskForms[index].taskExecMode === 3" label="开始时间" prop="scheduledTime">
                      <el-date-picker
                        v-model="taskForms[index].scheduledTime"
                        type="datetime"
                        placeholder="每天开始执行的时间"
                        :disabled-date="d => d.getTime() < Date.now() - 86400000"
                        value-format="YYYY-MM-DDTHH:mm:ss"
                      />
                    </el-form-item>
                    <el-form-item v-if="taskForms[index].taskExecMode === 3" label="执行天数" prop="execDays">
                      <el-input-number v-model="taskForms[index].execDays" :min="1" :max="365" />
                      <span class="ml-2 text-gray-400">天</span>
                    </el-form-item>
                    <el-form-item label="弹幕话术">
                      <div class="comments-container">
                        <el-input
                          v-model="commentsTextArray[index]"
                          type="textarea"
                          :rows="3"
                          placeholder="请输入弹幕话术，每行一条&#10;例如：&#10;主播好棒！&#10;支持主播！"
                          resize="both"
                          class="comments-textarea"
                          @input="handleCommentsInput(index)"
                        />
                        <div class="comments-preview">
                          <div class="preview-header">已添加 {{ taskForms[index].comments?.length || 0 }} 条话术：</div>
                          <div class="preview-list">
                            <el-tag
                              v-for="(comment, cIndex) in taskForms[index].comments"
                              :key="cIndex"
                              closable
                              @close="removeComment(index, cIndex)"
                              type="primary"
                              size="small"
                              class="comment-tag"
                            >
                              {{ comment }}
                            </el-tag>
                            <span v-if="!taskForms[index].comments || taskForms[index].comments.length === 0" class="text-gray-400 text-sm">暂无话术，请在上面的输入框中输入，每行一条</span>
                          </div>
                        </div>
                      </div>
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </div>
          </section>

          <!-- Step 3: Coupon -->
          <section class="checkout-section">
            <div class="section-header">
              <h3>优惠券</h3>
            </div>
            <div class="coupon-area">
              <el-button type="primary" link>选择优惠券</el-button>
              <span class="coupon-tip">（暂无可用优惠券）</span>
            </div>
          </section>

          <!-- Step 4: Remark -->
          <section class="checkout-section">
            <div class="section-header">
              <h3>订单备注</h3>
            </div>
            <el-input
              v-model="remark"
              type="textarea"
              :rows="3"
              placeholder="选填：对本次交易的说明"
              maxlength="200"
              show-word-limit
            />
          </section>
        </div>

        <!-- Right: Order Summary Sidebar -->
        <div class="checkout-sidebar">
          <div class="summary-card">
            <h3 class="summary-title">订单摘要</h3>
            <div class="summary-rows">
              <div class="summary-row">
                <span>商品总价</span>
                <span>¥{{ fenToYuan(goodsTotalPrice) }}</span>
              </div>
              <div class="summary-row">
                <span>运费</span>
                <span>¥{{ fenToYuan(freightPrice) }}</span>
              </div>
              <div class="summary-row">
                <span>优惠券折扣</span>
                <span class="discount">-¥{{ fenToYuan(couponPrice) }}</span>
              </div>
              <div class="summary-row total">
                <span>应付金额</span>
                <span class="pay-price">¥{{ fenToYuan(payPrice) }}</span>
              </div>
            </div>
            <el-button
              type="primary"
              size="large"
              class="submit-btn"
              :loading="submitLoading"
              @click="handleSubmitOrder"
            >
              提交订单
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Address Dialog -->
    <el-dialog v-model="showAddressDialog" title="新增收货地址" width="500px" :close-on-click-modal="false">
      <el-form
        ref="addressFormRef"
        :model="addressForm"
        :rules="addressRules"
        label-width="80px"
      >
        <el-form-item label="收货人" prop="name">
          <el-input v-model="addressForm.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addressForm.mobile" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="所在地区" prop="areaId">
          <el-cascader
            v-model="addressForm.areaId"
            placeholder="请选择省/市/区"
            :options="areaOptions"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input v-model="addressForm.detailAddress" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="">
          <el-checkbox v-model="addressForm.defaultStatus">设为默认地址</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddressDialog = false">取消</el-button>
        <el-button type="primary" :loading="addressSaving" @click="handleAddAddress">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { useCartStore } from '@/store/modules/cart'
import type { TaskForm } from '@/store/modules/cart'
import { getAddressList, createAddress } from '@/api/member/address'
import { createOrder } from '@/api/trade/order'
import type { Address } from '@/types'
import { fenToYuan } from '@/utils/price'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

const addressList = ref<Address[]>([])
const selectedAddressId = ref<number>()
const remark = ref('')
const submitLoading = ref(false)
const showAddressDialog = ref(false)
const addressSaving = ref(false)

const freightPrice = ref(0)
const couponPrice = ref(0)

// Task forms - one per selected item
const taskForms = ref<TaskForm[]>([])
const taskFormRefs = ref<any[]>([])
const commentsTextArray = ref<string[]>([])

// 处理话术输入：按行分割
const handleCommentsInput = (index: number) => {
  const text = commentsTextArray.value[index] || ''
  if (!text.trim()) {
    taskForms.value[index].comments = []
    return
  }
  // 按行分割，过滤空行
  taskForms.value[index].comments = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

// 删除话术
const removeComment = (index: number, cIndex: number) => {
  if (!taskForms.value[index].comments) {
    taskForms.value[index].comments = []
  }
  taskForms.value[index].comments.splice(cIndex, 1)
  // 同步更新文本域内容
  commentsTextArray.value[index] = taskForms.value[index].comments.join('\n')
}

const taskRules: FormRules = {
  homeUrl: [{ required: true, message: '请输入主页链接', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入任务时长', trigger: 'blur' }],
  taskExecMode: [{ required: true, message: '请选择执行方式', trigger: 'change' }],
  scheduledTime: [{ required: true, message: '请选择执行时间', trigger: 'change' }],
  execDays: [{ required: true, message: '请输入执行天数', trigger: 'blur' }]
}

const areaOptions = ref<any[]>([])

// Address form
const addressFormRef = ref<FormInstance>()
const addressForm = reactive({
  name: '',
  mobile: '',
  areaId: 0,
  detailAddress: '',
  defaultStatus: false
})

const addressRules: FormRules = {
  name: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
  mobile: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  areaId: [{ required: true, message: '请选择地区', trigger: 'change' }],
  detailAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

const goodsTotalPrice = computed(() => cartStore.totalPrice)

const payPrice = computed(() =>
  Math.max(0, goodsTotalPrice.value + freightPrice.value - couponPrice.value)
)

async function loadAddresses() {
  try {
    const data = await getAddressList()
    addressList.value = data
    // Auto-select default address or first
    const defaultAddr = data.find((a: Address) => a.defaultStatus)
    if (defaultAddr?.id) {
      selectedAddressId.value = defaultAddr.id
    } else if (data.length > 0 && data[0].id) {
      selectedAddressId.value = data[0].id
    }
  } catch {
    // ignore
  }
}

async function handleAddAddress() {
  const form = addressFormRef.value
  if (!form) return
  await form.validate()
  addressSaving.value = true
  try {
    await createAddress({
      name: addressForm.name,
      mobile: addressForm.mobile,
      areaId: addressForm.areaId,
      detailAddress: addressForm.detailAddress,
      defaultStatus: addressForm.defaultStatus
    })
    ElMessage.success('地址添加成功')
    showAddressDialog.value = false
    resetAddressForm()
    await loadAddresses()
  } catch (e: any) {
    // 拦截器已弹出后端错误提示
  } finally {
    addressSaving.value = false
  }
}

function resetAddressForm() {
  addressForm.name = ''
  addressForm.mobile = ''
  addressForm.areaId = 0
  addressForm.detailAddress = ''
  addressForm.defaultStatus = false
  addressFormRef.value?.resetFields()
}

async function handleSubmitOrder() {
  if (cartStore.selectedItems.length === 0) {
    ElMessage.warning('没有选中的商品')
    return
  }
  if (!cartStore.allVirtual && !selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }

  // Validate task forms
  for (let i = 0; i < taskFormRefs.value.length; i++) {
    const formRef = taskFormRefs.value[i]
    if (formRef) {
      try {
        await formRef.validate()
      } catch {
        ElMessage.warning(`请完善第 ${i + 1} 个商品的任务参数`)
        return
      }
    }
  }

  submitLoading.value = true
  try {
    const items = cartStore.selectedItems.map((item, index) => {
      const task = taskForms.value[index]
      // Sync back to cart store
      if (task) {
        cartStore.setTaskParams(item.sku.id, task)
      }
      return {
        skuId: item.sku.id,
        count: item.count,
        cartId: item.id,
        homeUrl: task?.homeUrl || '',
        duration: task?.duration || 1,
        taskExecMode: task?.taskExecMode || 1,
        scheduledTime: task?.scheduledTime || undefined,
        execDays: task?.execDays || undefined,
        comments: task?.comments || []
      }
    })
    const deliveryType = cartStore.allVirtual ? 3 : 1
    const res = await createOrder({
      items,
      addressId: cartStore.allVirtual ? undefined : selectedAddressId.value,
      deliveryType,
      remark: remark.value || undefined,
      pointStatus: false
    })
    // 跳转到支付页面
    if (res.payOrderId) {
      router.push(`/payment/${res.id}`)
    } else {
      // 无需支付的订单（金额为0）
      ElMessage.success('下单成功')
      router.push('/user/order/list')
    }
  } catch (e: any) {
    // 拦截器已弹出后端错误提示
  } finally {
    submitLoading.value = false
  }
}

onMounted(async () => {
  // Ensure cart is loaded
  if (cartStore.list.length === 0) {
    await cartStore.getList()
  }
  if (cartStore.selectedItems.length === 0) {
    router.replace('/cart')
    return
  }
  // Initialize task forms from route query (立即购买) or store (购物车)
  const qSkuId = route.query.taskSkuId ? String(route.query.taskSkuId) : null
  const qParams: Record<string, TaskForm> = {}
  if (qSkuId) {
    qParams[qSkuId] = {
      homeUrl: (route.query.taskHomeUrl as string) || '',
      duration: route.query.taskDuration ? Number(route.query.taskDuration) : 1,
      taskExecMode: route.query.taskExecMode ? Number(route.query.taskExecMode) : 1,
      scheduledTime: (route.query.taskScheduledTime as string) || null,
      execDays: route.query.taskExecDays ? Number(route.query.taskExecDays) : 1,
      comments: route.query.taskComments ? JSON.parse(route.query.taskComments as string) : []
    }
  }
  taskForms.value = cartStore.selectedItems.map(item => {
    const key = String(item.sku.id)
    // Priority: route query > store > default
    if (qParams[key]) {
      return { ...qParams[key] }
    }
    const stored = cartStore.getTaskParams(item.sku.id)
    if (stored.homeUrl) {
      return { ...stored, comments: stored.comments || [] }
    }
    return { homeUrl: '', duration: 1, taskExecMode: 1, scheduledTime: null, execDays: 1, comments: [] }
  })
  // Initialize commentsTextArray
  commentsTextArray.value = taskForms.value.map(item => {
    const comments = item.comments || []
    return comments.join('\n')
  })
  loadAddresses()
})
</script>

<style scoped lang="scss">
.checkout-page {
  padding: $mall-spacing-lg 0 $mall-spacing-xl;
  min-height: 60vh;
}

.page-title {
  font-size: $mall-font-size-xl;
  color: $mall-text-primary;
  font-weight: 600;
  margin-bottom: $mall-spacing-lg;
}

.checkout-layout {
  display: flex;
  gap: $mall-spacing-lg;
  align-items: flex-start;
}

.checkout-main {
  flex: 1;
  min-width: 0;
}

.checkout-sidebar {
  width: 300px;
  flex-shrink: 0;
  position: sticky;
  top: calc(#{$mall-header-height} + #{$mall-spacing-lg});
}

.checkout-section {
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

    h3 {
      font-size: $mall-font-size-lg;
      color: $mall-text-primary;
      font-weight: 600;
      margin: 0;
    }
  }
}

// Address
.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $mall-spacing-md;
}

.address-card {
  position: relative;
  border: 2px solid $mall-border-color;
  border-radius: $mall-radius-md;
  padding: $mall-spacing-md;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: $mall-primary-light;
  }

  &.active {
    border-color: $mall-primary;
  }
}

.address-info {
  display: flex;
  align-items: center;
  gap: $mall-spacing-sm;
  margin-bottom: $mall-spacing-sm;

  .name {
    font-weight: 600;
    color: $mall-text-primary;
  }

  .mobile {
    color: $mall-text-secondary;
    font-size: $mall-font-size-sm;
  }
}

.address-detail {
  font-size: $mall-font-size-sm;
  color: $mall-text-secondary;
  line-height: 1.5;
}

.address-check {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 40px 40px 0;
  border-color: transparent $mall-primary transparent transparent;

  .el-icon {
    position: absolute;
    top: 4px;
    right: -36px;
    color: #fff;
    font-size: 14px;
  }
}

.no-address-tip {
  color: $mall-text-muted;
  font-size: $mall-font-size-sm;
  margin: 0;
}

// Products
.product-item {
  display: flex;
  align-items: center;
  gap: $mall-spacing-md;
  padding: $mall-spacing-md 0;
  border-bottom: 1px solid $mall-border-color;

  &:last-child {
    border-bottom: none;
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

// Product block with task fields
.product-block {
  border-bottom: 1px solid $mall-border-color;
  padding: $mall-spacing-md 0;

  &:last-child {
    border-bottom: none;
  }
}

.task-fields {
  margin-top: $mall-spacing-sm;
  padding-top: $mall-spacing-sm;
  border-top: 1px dashed $mall-border-color;

  .task-form {
    :deep(.el-form-item) {
      margin-bottom: $mall-spacing-xs;
    }
    :deep(.el-form-item__label) {
      font-size: $mall-font-size-sm;
      color: $mall-text-secondary;
    }
  }

  .comments-container {
    width: 100%;

    .comments-textarea {
      margin-bottom: $mall-spacing-xs;
    }

    .comments-preview {
      .preview-header {
        font-size: 12px;
        color: $mall-text-secondary;
        margin-bottom: $mall-spacing-xs;
      }

      .preview-list {
        display: flex;
        flex-wrap: wrap;
        gap: $mall-spacing-xs;
        min-height: 24px;

        .comment-tag {
          margin: 0;
        }
      }
    }
  }
}

// Coupon
.coupon-area {
  display: flex;
  align-items: center;
  gap: $mall-spacing-sm;

  .coupon-tip {
    font-size: $mall-font-size-sm;
    color: $mall-text-muted;
  }
}

// Summary Sidebar
.summary-card {
  background: $mall-bg-white;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
  padding: $mall-spacing-lg;

  .summary-title {
    font-size: $mall-font-size-lg;
    color: $mall-text-primary;
    font-weight: 600;
    margin: 0 0 $mall-spacing-md;
    padding-bottom: $mall-spacing-md;
    border-bottom: 1px solid $mall-border-color;
  }
}

.summary-rows {
  margin-bottom: $mall-spacing-lg;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: $mall-spacing-sm 0;
  font-size: $mall-font-size-base;
  color: $mall-text-secondary;

  &.total {
    padding-top: $mall-spacing-md;
    margin-top: $mall-spacing-sm;
    border-top: 1px solid $mall-border-color;
    font-size: $mall-font-size-lg;
    color: $mall-text-primary;
    font-weight: 600;
  }

  .discount {
    color: $mall-success;
  }

  .pay-price {
    color: $mall-price-color;
    font-size: $mall-font-size-xl;
    font-weight: 700;
  }
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: $mall-font-size-lg;
}
</style>
