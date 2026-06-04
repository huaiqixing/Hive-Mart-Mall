<template>
  <div class="product-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="container">
      <el-skeleton animated :rows="8" />
    </div>

    <!-- Main Content -->
    <template v-else-if="spu">
      <!-- Breadcrumb -->
      <div class="container breadcrumb-wrap">
        <el-breadcrumb separator=">">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item
            v-if="spu.categoryName"
            :to="{ name: 'ProductList', query: { categoryId: String(spu.categoryId) } }"
          >
            {{ spu.categoryName }}
          </el-breadcrumb-item>
          <el-breadcrumb-item>{{ spu.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- Product Info Section -->
      <div class="container info-section">
        <!-- Left: Image Gallery -->
        <div class="gallery">
          <div class="main-image-wrap" @mousemove="handleImageZoom" @mouseleave="hideZoom">
            <img
              ref="mainImageRef"
              :src="currentImage"
              :alt="spu.name"
              class="main-image"
            />
            <div v-if="zoomVisible" class="zoom-lens" :style="zoomLensStyle" />
          </div>
          <div v-if="zoomVisible" class="zoom-preview" :style="zoomPreviewStyle">
            <img :src="currentImage" class="zoom-preview-img" :style="zoomPreviewImgStyle" />
          </div>
          <div class="thumbnail-strip">
            <div
              v-for="(url, index) in allImages"
              :key="index"
              class="thumbnail-item"
              :class="{ active: currentImageIndex === index }"
              @mouseenter="currentImageIndex = index"
            >
              <img :src="url" :alt="`${spu.name} - ${index + 1}`" />
            </div>
          </div>
        </div>

        <!-- Right: Product Info -->
        <div class="info-right">
          <div class="info-header">
            <h1 class="product-name">{{ spu.name }}</h1>
            <p v-if="spu.introduction" class="product-intro">{{ spu.introduction }}</p>
          </div>

          <div class="price-block">
            <div class="price-main">
              <span class="price-label">价格</span>
              <span class="current-price">
                <em>¥</em>{{ fenToYuan(currentSku ? currentSku.price : spu.price) }}
              </span>
              <span
                v-if="originalPrice > displayPrice"
                class="original-price"
              >
                ¥{{ fenToYuan(originalPrice) }}
              </span>
              <span v-if="discountPercent" class="discount-badge">
                {{ discountPercent }}折
              </span>
            </div>
          </div>

          <!-- Spec Selector -->
          <div v-if="specGroups.length" class="spec-section">
            <div
              v-for="(group, gIdx) in specGroups"
              :key="group.id"
              class="spec-group"
            >
              <div class="spec-label">{{ group.name }}：</div>
              <div class="spec-values">
                <span
                  v-for="val in group.values"
                  :key="val.id"
                  class="spec-value-btn"
                  :class="{
                    selected: selectedSpecs[group.id] === val.id,
                    disabled: isSpecValueDisabled(group.id, val.id)
                  }"
                  @click="selectSpec(group.id, val.id)"
                >
                  {{ val.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quantity -->
          <div class="quantity-section">
            <span class="section-label">数量</span>
            <el-input-number
              v-model="quantity"
              :min="1"
              :max="maxStock"
              :step="1"
              size="large"
            />
            <span class="stock-tip">
              {{ stockText }}
            </span>
          </div>

          <!-- Task Parameters (flat, same level as quantity) -->
          <div class="form-row">
            <span class="section-label">主页链接</span>
            <el-input v-model="taskForm.homeUrl" placeholder="请输入直播间主页链接" size="large" class="form-input" />
          </div>
          <div class="form-row">
            <span class="section-label">任务时长</span>
            <el-input-number v-model="taskForm.duration" :min="1" placeholder="小时" size="large" />
            <span class="unit-label">小时</span>
          </div>
          <div class="form-row">
            <span class="section-label">执行方式</span>
            <el-radio-group v-model="taskForm.taskExecMode" size="large">
              <el-radio :value="1">立即执行</el-radio>
              <el-radio :value="2">定时执行</el-radio>
              <el-radio :value="3">每天执行</el-radio>
            </el-radio-group>
          </div>
          <div class="form-row" v-if="taskForm.taskExecMode === 2">
            <span class="section-label">执行时间</span>
            <el-date-picker
              v-model="taskForm.scheduledTime"
              type="datetime"
              placeholder="请选择执行时间"
              :disabled-date="d => d.getTime() < Date.now() - 86400000"
              value-format="YYYY-MM-DDTHH:mm:ss"
              size="large"
            />
          </div>
          <div class="form-row" v-if="taskForm.taskExecMode === 3">
            <span class="section-label">开始时间</span>
            <el-date-picker
              v-model="taskForm.scheduledTime"
              type="datetime"
              placeholder="请选择每天开始执行的时间"
              :disabled-date="d => d.getTime() < Date.now() - 86400000"
              value-format="YYYY-MM-DDTHH:mm:ss"
              size="large"
            />
          </div>
          <div class="form-row" v-if="taskForm.taskExecMode === 3">
            <span class="section-label">执行天数</span>
            <el-input-number v-model="taskForm.execDays" :min="1" :max="365" placeholder="天" size="large" />
            <span class="unit-label">天</span>
          </div>

          <!-- 弹幕话术 -->
          <div class="form-row comments-section">
            <div class="section-label-full">弹幕话术</div>
            <div class="comments-textarea-wrapper">
              <el-input
                v-model="commentsText"
                type="textarea"
                :rows="3"
                placeholder="请输入弹幕话术，每行一条&#10;例如：&#10;主播好棒！&#10;支持主播！"
                resize="both"
                class="comments-textarea"
                @input="handleCommentsInput"
              />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <el-button
              type="primary"
              size="large"
              class="btn-add-cart"
              :disabled="!canAddToCart"
              :loading="addingCart"
              @click="handleAddCart"
            >
              <el-icon><ShoppingCart /></el-icon>
              加入购物车
            </el-button>
            <el-button
              size="large"
              class="btn-buy-now"
              :disabled="!canAddToCart"
              @click="handleBuyNow"
            >
              立即购买
            </el-button>
            <el-button
              class="btn-favorite"
              :class="{ 'is-favorite': isFavorited }"
              circle
              size="large"
              @click="toggleFavorite"
            >
              <el-icon :size="20">
                <StarFilled v-if="isFavorited" />
                <Star v-else />
              </el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- Tabs Section -->
      <div class="container tabs-section">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品详情" name="detail">
            <div class="detail-content" v-html="spu.description || '<p>暂无详情</p>'" />
          </el-tab-pane>
          <el-tab-pane label="规格参数" name="spec">
            <div v-if="specGroups.length" class="spec-table-wrap">
              <table class="spec-table">
                <tr v-for="group in specGroups" :key="group.id">
                  <td class="spec-table-label">{{ group.name }}</td>
                  <td class="spec-table-value">
                    {{ group.values.map(v => v.name).join(' / ') }}
                  </td>
                </tr>
              </table>
            </div>
            <el-empty v-else description="暂无规格参数" :image-size="80" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </template>

    <!-- Not Found -->
    <div v-else class="container not-found">
      <el-empty description="商品不存在或已下架">
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart, Star, StarFilled } from '@element-plus/icons-vue'
import { getSpuDetail } from '@/api/product/spu'
import { createFavorite, deleteFavorite, checkFavorite } from '@/api/product/favorite'
import { useCartStore } from '@/store/modules/cart'
import { useUserStore } from '@/store/modules/user'
import type { ProductSpu, ProductSku, SpecGroup } from '@/types'
import { fenToYuan } from '@/utils/price'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

// Product state
const loading = ref(true)
const spu = ref<ProductSpu | null>(null)
const currentImageIndex = ref(0)
const selectedSpecs = ref<Record<number, number>>({})
const quantity = ref(1)
const addingCart = ref(false)
const isFavorited = ref(false)

// Task form
const taskForm = reactive({
  homeUrl: '',
  duration: 1,
  taskExecMode: 1,
  scheduledTime: null as string | null,
  execDays: 1,
  comments: [] as string[]
})

// 话术文本域内容
const commentsText = ref('')

// 话术预览列表
const commentsList = computed(() => taskForm.comments)

// 处理话术输入：按行分割
const handleCommentsInput = () => {
  const text = commentsText.value
  if (!text.trim()) {
    taskForm.comments = []
    return
  }
  // 按行分割，过滤空行
  taskForm.comments = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

// 删除话术
const removeComment = (index: number) => {
  taskForm.comments.splice(index, 1)
  // 同步更新文本域内容
  commentsText.value = taskForm.comments.join('\n')
}

// Zoom state
const zoomVisible = ref(false)
const zoomX = ref(0)
const zoomY = ref(0)
const mainImageRef = ref<HTMLImageElement | null>(null)

// Active tab
const activeTab = ref('detail')

// Computed: all images (slider first, then main pic)
const allImages = computed(() => {
  if (!spu.value) return []
  const images: string[] = []
  if (spu.value.sliderPicUrls?.length) {
    images.push(...spu.value.sliderPicUrls)
  }
  if (spu.value.picUrl && !images.includes(spu.value.picUrl)) {
    images.push(spu.value.picUrl)
  }
  return images.length ? images : [spu.value.picUrl || '']
})

const currentImage = computed(() => {
  return allImages.value[currentImageIndex.value] || ''
})

// Computed: spec groups
const specGroups = computed<SpecGroup[]>(() => {
  return spu.value?.specList || []
})

// Computed: current SKU based on selected specs
const currentSku = computed<ProductSku | null>(() => {
  if (!spu.value?.skus?.length) return null

  // If no spec groups, return first SKU
  if (specGroups.value.length === 0) return spu.value.skus[0]

  // Check if all specs are selected
  for (const group of specGroups.value) {
    if (selectedSpecs.value[group.id] === undefined) return null
  }

  // Find matching SKU
  return spu.value.skus.find(sku => {
    return specGroups.value.every(group => {
      const prop = sku.properties.find(p => p.propertyId === group.id)
      return prop && prop.valueId === selectedSpecs.value[group.id]
    })
  }) || null
})

const displayPrice = computed(() => {
  return currentSku.value ? currentSku.value.price : (spu.value?.price || 0)
})

const originalPrice = computed(() => {
  return spu.value?.marketPrice || 0
})

const discountPercent = computed(() => {
  if (!originalPrice.value || !displayPrice.value || originalPrice.value <= displayPrice.value) {
    return null
  }
  const ratio = displayPrice.value / originalPrice.value
  return (Math.round(ratio * 100) / 10).toFixed(1)
})

const maxStock = computed(() => {
  const stock = currentSku.value?.stock || spu.value?.stock
  // -1 表示无限库存
  if (stock === -1) return 9999
  return stock || 999
})

const stockText = computed(() => {
  const stock = currentSku.value?.stock
  if (stock === undefined) return ''
  // -1 表示无限库存
  if (stock === -1) return '库存充足'
  return stock > 0 ? `库存 ${stock} 件` : '已售罄'
})

const canAddToCart = computed(() => {
  if (!currentSku.value && specGroups.value.length > 0) return false
  const stock = currentSku.value?.stock
  // -1 表示无限库存，允许添加
  if (stock !== undefined && stock !== -1 && stock <= 0) return false
  return true
})

// Zoom computed styles
const zoomLensStyle = computed(() => ({
  left: `${zoomX.value - 75}px`,
  top: `${zoomY.value - 75}px`
}))

const zoomPreviewStyle = computed(() => ({
  backgroundImage: `url(${currentImage.value})`
}))

const zoomPreviewImgStyle = computed(() => ({
  transform: `translate(-${zoomX.value * 2 - 200}px, -${zoomY.value * 2 - 200}px)`
}))

// Methods
async function fetchProduct() {
  const id = Number(route.params.id)
  if (!id || isNaN(id)) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    spu.value = await getSpuDetail(id)
    currentImageIndex.value = 0
    selectedSpecs.value = {}
    quantity.value = 1

    // Auto-select if only one spec value per group
    if (specGroups.value.length) {
      for (const group of specGroups.value) {
        if (group.values.length === 1) {
          selectedSpecs.value[group.id] = group.values[0].id
        }
      }
    }

    // Update image to SKU pic if available
    if (currentSku.value?.picUrl) {
      const idx = allImages.value.indexOf(currentSku.value.picUrl)
      if (idx >= 0) currentImageIndex.value = idx
    }
  } catch (e) {
    spu.value = null
  } finally {
    loading.value = false
  }
}

async function checkFavoriteStatus() {
  if (!userStore.isLogin || !spu.value) {
    isFavorited.value = false
    return
  }
  try {
    isFavorited.value = await checkFavorite(spu.value.id)
  } catch {
    isFavorited.value = false
  }
}

function selectSpec(groupId: number, valueId: number) {
  if (isSpecValueDisabled(groupId, valueId)) return
  if (selectedSpecs.value[groupId] === valueId) {
    delete selectedSpecs.value[groupId]
  } else {
    selectedSpecs.value[groupId] = valueId
  }
  // Reset quantity if stock changed (excluding unlimited stock)
  if (currentSku.value && currentSku.value.stock !== -1 && quantity.value > currentSku.value.stock) {
    quantity.value = Math.max(1, currentSku.value.stock)
  }
  // Switch to SKU image if available
  if (currentSku.value?.picUrl) {
    const idx = allImages.value.indexOf(currentSku.value.picUrl)
    if (idx >= 0) currentImageIndex.value = idx
  }
}

function isSpecValueDisabled(groupId: number, valueId: number): boolean {
  if (!spu.value?.skus?.length) return false
  // Build a temp selection with this value
  const tempSpecs = { ...selectedSpecs.value, [groupId]: valueId }
  // Check if any SKU matches all selected specs including this one
  return !spu.value.skus.some(sku => {
    return specGroups.value.every(group => {
      const selectedVal = tempSpecs[group.id]
      if (selectedVal === undefined) return true
      const prop = sku.properties.find(p => p.propertyId === group.id)
      return prop && prop.valueId === selectedVal
    })
  })
}

// Zoom methods
function handleImageZoom(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const w = rect.width
  const h = rect.height

  if (x < 0 || y < 0 || x > w || y > h) {
    zoomVisible.value = false
    return
  }

  zoomVisible.value = true
  zoomX.value = x
  zoomY.value = y
}

function hideZoom() {
  zoomVisible.value = false
}

// Cart & Buy
async function handleAddCart() {
  if (!canAddToCart.value || !spu.value) return
  const sku = currentSku.value
  if (!sku) {
    ElMessage.warning('请选择商品规格')
    return
  }
  // Validate task params
  if (!taskForm.homeUrl.trim()) {
    ElMessage.warning('请输入主页链接')
    return
  }
  if ((taskForm.taskExecMode === 2 || taskForm.taskExecMode === 3) && !taskForm.scheduledTime) {
    ElMessage.warning('请选择执行时间')
    return
  }
  if (taskForm.taskExecMode === 3 && (!taskForm.execDays || taskForm.execDays < 1)) {
    ElMessage.warning('请输入执行天数')
    return
  }
  addingCart.value = true
  try {
    await cartStore.addItem(sku.id, quantity.value)
    // Save task params to store for this SKU
    cartStore.setTaskParams(sku.id, {
      homeUrl: taskForm.homeUrl,
      duration: taskForm.duration,
      taskExecMode: taskForm.taskExecMode,
      scheduledTime: taskForm.scheduledTime,
      execDays: taskForm.execDays,
      comments: taskForm.comments
    })
    ElMessage.success('已加入购物车')
  } catch {
    ElMessage.error('加入购物车失败，请重试')
  } finally {
    addingCart.value = false
  }
}

async function handleBuyNow() {
  if (!canAddToCart.value || !spu.value) return
  const sku = currentSku.value
  if (!sku) {
    ElMessage.warning('请选择商品规格')
    return
  }
  // Validate task params
  if (!taskForm.homeUrl.trim()) {
    ElMessage.warning('请输入主页链接')
    return
  }
  if ((taskForm.taskExecMode === 2 || taskForm.taskExecMode === 3) && !taskForm.scheduledTime) {
    ElMessage.warning('请选择执行时间')
    return
  }
  if (taskForm.taskExecMode === 3 && (!taskForm.execDays || taskForm.execDays < 1)) {
    ElMessage.warning('请输入执行天数')
    return
  }
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }
  try {
    // Use cartStore.addItem to refresh store before navigating
    await cartStore.addItem(sku.id, quantity.value)
    // Save task params to store
    cartStore.setTaskParams(sku.id, {
      homeUrl: taskForm.homeUrl,
      duration: taskForm.duration,
      taskExecMode: taskForm.taskExecMode,
      scheduledTime: taskForm.scheduledTime,
      execDays: taskForm.execDays,
      comments: taskForm.comments
    })
    // Also pass via route query as primary source
    router.push({
      path: '/checkout',
      query: {
        taskSkuId: String(sku.id),
        taskHomeUrl: taskForm.homeUrl,
        taskDuration: String(taskForm.duration),
        taskExecMode: String(taskForm.taskExecMode),
        taskScheduledTime: taskForm.scheduledTime || '',
        taskExecDays: String(taskForm.execDays || 1),
        taskComments: JSON.stringify(taskForm.comments)
      }
    })
  } catch {
    ElMessage.error('操作失败，请重试')
  }
}

// Favorite
async function toggleFavorite() {
  if (!spu.value) return
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }
  try {
    if (isFavorited.value) {
      await deleteFavorite(spu.value.id)
      isFavorited.value = false
      ElMessage.success('已取消收藏')
    } else {
      await createFavorite(spu.value.id)
      isFavorited.value = true
      ElMessage.success('已收藏')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

// Lifecycle
onMounted(async () => {
  await fetchProduct()
  checkFavoriteStatus()
})

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    fetchProduct()
    checkFavoriteStatus()
  }
})
</script>

<style scoped lang="scss">
.product-detail-page {
  padding-bottom: $mall-spacing-xl;
}

.container {
  max-width: $mall-content-max-width;
  margin: 0 auto;
  padding: 0 $mall-spacing-md;
}

// Breadcrumb
.breadcrumb-wrap {
  padding-top: $mall-spacing-md;
  padding-bottom: $mall-spacing-sm;
}

// Info Section
.info-section {
  display: flex;
  gap: $mall-spacing-lg;
  background: $mall-bg-white;
  border-radius: $mall-radius-md;
  padding: $mall-spacing-lg;
  margin-bottom: $mall-spacing-md;
  position: relative;
}

// Gallery
.gallery {
  width: 420px;
  min-width: 420px;
  position: relative;
}

.main-image-wrap {
  width: 420px;
  height: 420px;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
  overflow: hidden;
  cursor: crosshair;
  position: relative;
  background: $mall-bg-gray;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.zoom-lens {
  position: absolute;
  width: 150px;
  height: 150px;
  border: 1px solid $mall-border-color;
  background: rgba($mall-primary, 0.1);
  pointer-events: none;
  border-radius: $mall-radius-sm;
}

.zoom-preview {
  position: absolute;
  left: 430px;
  top: 0;
  width: 400px;
  height: 400px;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
  overflow: hidden;
  background-color: $mall-bg-gray;
  background-repeat: no-repeat;
  z-index: 100;
  pointer-events: none;
}

.zoom-preview-img {
  width: 840px;
  height: 840px;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.thumbnail-strip {
  display: flex;
  gap: $mall-spacing-xs;
  margin-top: $mall-spacing-sm;
  overflow-x: auto;
  padding-bottom: $mall-spacing-xs;
}

.thumbnail-item {
  width: 60px;
  height: 60px;
  min-width: 60px;
  border: 2px solid transparent;
  border-radius: $mall-radius-sm;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
  background: $mall-bg-gray;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover,
  &.active {
    border-color: $mall-primary;
  }
}

// Right Info
.info-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.info-header {
  margin-bottom: $mall-spacing-md;
}

.product-name {
  font-size: $mall-font-size-xl;
  font-weight: 600;
  color: $mall-text-primary;
  line-height: 1.4;
  margin-bottom: $mall-spacing-xs;
}

.product-intro {
  font-size: $mall-font-size-sm;
  color: $mall-text-secondary;
  line-height: 1.5;
}

// Price Block
.price-block {
  background: #fef0f0;
  border-radius: $mall-radius-md;
  padding: $mall-spacing-md $mall-spacing-lg;
  margin-bottom: $mall-spacing-md;
}

.price-main {
  display: flex;
  align-items: baseline;
  gap: $mall-spacing-sm;
}

.price-label {
  font-size: $mall-font-size-sm;
  color: $mall-text-muted;
}

.current-price {
  font-size: 28px;
  font-weight: bold;
  color: $mall-price-color;
  line-height: 1;

  em {
    font-size: $mall-font-size-lg;
    font-style: normal;
  }
}

.original-price {
  font-size: $mall-font-size-base;
  color: $mall-text-muted;
  text-decoration: line-through;
}

.discount-badge {
  display: inline-block;
  background: $mall-primary;
  color: #fff;
  font-size: $mall-font-size-xs;
  padding: 2px 6px;
  border-radius: $mall-radius-sm;
  font-weight: 600;
  vertical-align: middle;
}

// Spec Section
.spec-section {
  margin-bottom: $mall-spacing-md;
}

.spec-group {
  display: flex;
  align-items: flex-start;
  margin-bottom: $mall-spacing-md;

  &:last-child {
    margin-bottom: 0;
  }
}

.spec-label {
  width: 60px;
  min-width: 60px;
  font-size: $mall-font-size-base;
  color: $mall-text-secondary;
  padding-top: 6px;
}

.spec-values {
  display: flex;
  flex-wrap: wrap;
  gap: $mall-spacing-sm;
}

.spec-value-btn {
  display: inline-block;
  padding: 6px 16px;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
  font-size: $mall-font-size-base;
  color: $mall-text-primary;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;

  &:hover {
    border-color: $mall-primary;
    color: $mall-primary;
  }

  &.selected {
    border-color: $mall-primary;
    color: $mall-primary;
    background: rgba($mall-primary, 0.05);
    font-weight: 600;
  }

  &.disabled {
    border-color: $mall-border-color;
    color: $mall-text-muted;
    background: $mall-bg-gray;
    cursor: not-allowed;
    text-decoration: line-through;

    &:hover {
      border-color: $mall-border-color;
      color: $mall-text-muted;
    }
  }
}

// Quantity Section
.quantity-section {
  display: flex;
  align-items: center;
  gap: $mall-spacing-sm;
  margin-bottom: $mall-spacing-lg;
}

.section-label {
  font-size: $mall-font-size-base;
  color: $mall-text-secondary;
  width: 60px;
  min-width: 60px;
}

.stock-tip {
  font-size: $mall-font-size-sm;
  color: $mall-text-muted;
  margin-left: $mall-spacing-sm;
}

// Form Row (quantity, task params — same flat layout)
.form-row {
  display: flex;
  align-items: center;
  gap: $mall-spacing-sm;
  margin-bottom: $mall-spacing-md;

  .form-input {
    max-width: 360px;
  }

  &.comments-section {
    flex-direction: column;
    align-items: flex-start;
    gap: $mall-spacing-sm;
  }
}

.section-label-full {
  font-size: $mall-font-size-base;
  color: $mall-text-secondary;
  width: 100%;
  margin-bottom: $mall-spacing-xs;
}

.comments-input-area {
  width: 100%;
  max-width: 500px;

  .comment-input {
    margin-bottom: $mall-spacing-sm;
  }

  .comments-list {
    display: flex;
    flex-wrap: wrap;
    gap: $mall-spacing-xs;
    min-height: 32px;

    .comment-tag {
      margin: 0;
    }

    .no-comments {
      color: $mall-text-muted;
      font-size: $mall-font-size-sm;
      padding: $mall-spacing-xs 0;
    }
  }
}

.comments-textarea-wrapper {
  width: 100%;
  max-width: 650px;

  .comments-textarea {
    width: 100%;
    margin-bottom: $mall-spacing-sm;
  }

  .comments-preview {
    .preview-header {
      font-size: $mall-font-size-sm;
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

      .no-comments {
        color: $mall-text-muted;
        font-size: $mall-font-size-sm;
        padding: $mall-spacing-xs 0;
      }
    }
  }
}

.unit-label {
  font-size: $mall-font-size-sm;
  color: $mall-text-muted;
}

// Action Buttons
.action-buttons {
  display: flex;
  gap: $mall-spacing-md;
  align-items: center;
  margin-top: auto;
}

.btn-add-cart {
  min-width: 160px;
  height: 48px;
  font-size: $mall-font-size-lg;
  font-weight: 600;
}

.btn-buy-now {
  min-width: 160px;
  height: 48px;
  font-size: $mall-font-size-lg;
  font-weight: 600;
  color: $mall-primary;
  border-color: $mall-primary;
  background: transparent;

  &:hover {
    color: #fff;
    background: $mall-primary-light;
    border-color: $mall-primary-light;
  }
}

.btn-favorite {
  width: 48px;
  height: 48px;

  &.is-favorite {
    color: $mall-primary;
    border-color: $mall-primary;

    &:hover {
      background: rgba($mall-primary, 0.06);
    }
  }
}

// Tabs Section
.tabs-section {
  background: $mall-bg-white;
  border-radius: $mall-radius-md;
  padding: $mall-spacing-lg;

  :deep(.el-tabs__header) {
    margin-bottom: $mall-spacing-md;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
  }

  :deep(.el-tabs__active-bar) {
    background-color: $mall-primary;
  }

  :deep(.el-tabs__item.is-active) {
    color: $mall-primary;
  }

  :deep(.el-tabs__item:hover) {
    color: $mall-primary;
  }
}

// Detail Content
.detail-content {
  line-height: 1.8;
  color: $mall-text-primary;
  word-break: break-word;

  :deep(img) {
    max-width: 100%;
    height: auto;
    display: block;
    margin: $mall-spacing-md auto;
    border-radius: $mall-radius-sm;
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: $mall-spacing-md 0;
  }

  :deep(td),
  :deep(th) {
    border: 1px solid $mall-border-color;
    padding: $mall-spacing-sm $mall-spacing-md;
  }
}

// Spec Table
.spec-table-wrap {
  padding: $mall-spacing-sm 0;
}

.spec-table {
  width: 100%;
  border-collapse: collapse;

  td {
    padding: $mall-spacing-sm $mall-spacing-md;
    border-bottom: 1px solid $mall-border-color;
    font-size: $mall-font-size-base;
  }
}

.spec-table-label {
  width: 120px;
  color: $mall-text-secondary;
  background: $mall-bg-gray;
  font-weight: 500;
}

.spec-table-value {
  color: $mall-text-primary;
}

// Not Found
.not-found {
  padding: $mall-spacing-xl * 3 0;
  text-align: center;
}

// Responsive
@media (max-width: 960px) {
  .info-section {
    flex-direction: column;
  }

  .gallery {
    width: 100%;
    min-width: auto;
  }

  .main-image-wrap {
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;
  }

  .zoom-preview {
    display: none;
  }
}
</style>
