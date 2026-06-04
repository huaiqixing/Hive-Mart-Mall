<template>
  <div class="product-list-page container">
    <!-- Breadcrumb -->
    <el-breadcrumb separator=">" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-if="currentCategoryName">{{ currentCategoryName }}</el-breadcrumb-item>
      <el-breadcrumb-item v-else>全部商品</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="page-body">
      <!-- Sidebar: Category Filter -->
      <aside class="sidebar">
        <div class="sidebar-title">商品分类</div>
        <ul class="category-list">
          <li
            class="category-item"
            :class="{ active: !queryParams.categoryId }"
            @click="selectCategory(undefined)"
          >
            全部分类
          </li>
          <li
            v-for="cat in flatCategories"
            :key="cat.id"
            class="category-item"
            :class="{
              active: queryParams.categoryId === cat.id,
              'is-child': cat.parentId && cat.parentId !== 0
            }"
            @click="selectCategory(cat.id)"
          >
            <span class="category-name">{{ cat.name }}</span>
          </li>
        </ul>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Sort Bar -->
        <div class="sort-bar">
          <div class="sort-options">
            <span
              class="sort-item"
              :class="{ active: queryParams.sortField === undefined }"
              @click="changeSort(undefined)"
            >综合</span>
            <span
              class="sort-item"
              :class="{ active: queryParams.sortField === 'price' }"
              @click="togglePriceSort"
            >
              价格
              <i
                v-if="queryParams.sortField === 'price'"
                :class="queryParams.sortAsc ? 'el-icon-top' : 'el-icon-bottom'"
              />
              <i v-else class="sort-arrows">
                <span class="arrow-up" />
                <span class="arrow-down" />
              </i>
            </span>
            <span
              class="sort-item"
              :class="{ active: queryParams.sortField === 'salesCount' }"
              @click="changeSort('salesCount')"
            >销量</span>
            <span
              class="sort-item"
              :class="{ active: queryParams.sortField === 'createTime' }"
              @click="changeSort('createTime')"
            >最新</span>
          </div>
          <div class="price-range">
            <el-input
              v-model.number="priceMin"
              placeholder="最低价"
              size="small"
              class="price-input"
              @keyup.enter="applyPriceFilter"
            />
            <span class="price-separator">-</span>
            <el-input
              v-model.number="priceMax"
              placeholder="最高价"
              size="small"
              class="price-input"
              @keyup.enter="applyPriceFilter"
            />
            <el-button size="small" @click="applyPriceFilter">确定</el-button>
          </div>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="loading" class="product-grid">
          <div v-for="n in 8" :key="n" class="product-card-skeleton">
            <el-skeleton animated>
              <template #template>
                <el-skeleton-item variant="image" style="width: 100%; aspect-ratio: 1/1" />
                <div style="padding: 12px">
                  <el-skeleton-item variant="h3" style="width: 80%" />
                  <el-skeleton-item variant="text" style="width: 60%; margin-top: 8px" />
                  <el-skeleton-item variant="text" style="width: 40%; margin-top: 8px" />
                </div>
              </template>
            </el-skeleton>
          </div>
        </div>

        <!-- Empty State -->
        <el-empty
          v-else-if="productList.length === 0"
          description="暂无符合条件的商品"
          :image-size="160"
        >
          <el-button type="primary" @click="resetFilters">清除筛选条件</el-button>
        </el-empty>

        <!-- Product Grid -->
        <div v-else class="product-grid">
          <router-link
            v-for="product in productList"
            :key="product.id"
            :to="{ name: 'ProductDetail', params: { id: product.id } }"
            class="product-card"
          >
            <div class="card-image">
              <img :src="product.picUrl" :alt="product.name" loading="lazy" />
            </div>
            <div class="card-info">
              <h3 class="card-name ellipsis-2">{{ product.name }}</h3>
              <div class="card-price-row">
                <span class="card-price price">{{ fenToYuan(product.price) }}</span>
                <span v-if="product.marketPrice > product.price" class="card-original-price price-original">
                  {{ fenToYuan(product.marketPrice) }}
                </span>
              </div>
              <div class="card-sales">
                <span>已售 {{ formatSales(product.salesCount) }}</span>
              </div>
            </div>
          </router-link>
        </div>

        <!-- Pagination -->
        <div v-if="total > 0" class="pagination-wrap">
          <el-pagination
            v-model:current-page="queryParams.pageNo"
            v-model:page-size="queryParams.pageSize"
            :total="total"
            :page-sizes="[20, 40, 60, 80]"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSpuPage } from '@/api/product/spu'
import { useAppStore } from '@/store/modules/app'
import type { ProductSpu } from '@/types'
import { fenToYuan } from '@/utils/price'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// State
const loading = ref(false)
const productList = ref<ProductSpu[]>([])
const total = ref(0)
const priceMin = ref<number | undefined>(undefined)
const priceMax = ref<number | undefined>(undefined)

const queryParams = reactive({
  pageNo: 1,
  pageSize: 20,
  keyword: undefined as string | undefined,
  categoryId: undefined as number | undefined,
  sortField: undefined as string | undefined,
  sortAsc: undefined as boolean | undefined
})

// Computed
const flatCategories = computed(() => {
  const result: { id: number; name: string; parentId: number }[] = []
  for (const cat of appStore.categoryList) {
    result.push({ id: cat.id, name: cat.name, parentId: cat.parentId })
    if (cat.children?.length) {
      for (const child of cat.children) {
        result.push({ id: child.id, name: child.name, parentId: child.parentId })
      }
    }
  }
  return result
})

const currentCategoryName = computed(() => {
  if (!queryParams.categoryId) return ''
  const cat = flatCategories.value.find(c => c.id === queryParams.categoryId)
  return cat?.name || ''
})

// Methods
async function fetchProducts() {
  loading.value = true
  try {
    const params: any = {
      pageNo: queryParams.pageNo,
      pageSize: queryParams.pageSize
    }
    if (queryParams.keyword) params.keyword = queryParams.keyword
    if (queryParams.categoryId) params.categoryId = queryParams.categoryId
    if (queryParams.sortField) {
      params.sortField = queryParams.sortField
      params.sortAsc = queryParams.sortAsc
    }
    if (priceMin.value !== undefined && priceMin.value !== null) {
      params.minPrice = priceMin.value
    }
    if (priceMax.value !== undefined && priceMax.value !== null) {
      params.maxPrice = priceMax.value
    }
    const res = await getSpuPage(params)
    productList.value = res.list || []
    total.value = res.total || 0
  } catch (e) {
    productList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function selectCategory(id: number | undefined) {
  queryParams.categoryId = id
  queryParams.pageNo = 1
  updateRouteQuery()
}

function changeSort(field: string | undefined) {
  queryParams.sortField = field
  queryParams.sortAsc = field ? false : undefined
  queryParams.pageNo = 1
  updateRouteQuery()
}

function togglePriceSort() {
  if (queryParams.sortField === 'price') {
    queryParams.sortAsc = !queryParams.sortAsc
  } else {
    queryParams.sortField = 'price'
    queryParams.sortAsc = true
  }
  queryParams.pageNo = 1
  updateRouteQuery()
}

function applyPriceFilter() {
  queryParams.pageNo = 1
  fetchProducts()
}

function resetFilters() {
  queryParams.keyword = undefined
  queryParams.categoryId = undefined
  queryParams.sortField = undefined
  queryParams.sortAsc = undefined
  priceMin.value = undefined
  priceMax.value = undefined
  queryParams.pageNo = 1
  router.replace({ name: 'ProductList' })
}

function handlePageChange(page: number) {
  queryParams.pageNo = page
  fetchProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleSizeChange(size: number) {
  queryParams.pageSize = size
  queryParams.pageNo = 1
  fetchProducts()
}

function updateRouteQuery() {
  const query: Record<string, string> = {}
  if (queryParams.keyword) query.keyword = queryParams.keyword
  if (queryParams.categoryId) query.categoryId = String(queryParams.categoryId)
  if (queryParams.sortField) {
    query.sortField = queryParams.sortField
    query.sortAsc = String(!!queryParams.sortAsc)
  }
  router.replace({ name: 'ProductList', query })
}

function formatSales(count: number): string {
  if (count >= 10000) return (count / 10000).toFixed(1) + '万'
  if (count >= 1000) return (count / 1000).toFixed(1) + '千'
  return String(count)
}

function syncFromRoute() {
  const q = route.query
  queryParams.keyword = (q.keyword as string) || undefined
  queryParams.categoryId = q.categoryId ? Number(q.categoryId) : undefined
  queryParams.sortField = (q.sortField as string) || undefined
  queryParams.sortAsc = q.sortAsc === 'true' ? true : q.sortAsc === 'false' ? false : undefined
  queryParams.pageNo = 1
}

// Lifecycle
onMounted(async () => {
  await appStore.loadCategories()
  syncFromRoute()
  fetchProducts()
})

watch(() => route.query, () => {
  syncFromRoute()
  fetchProducts()
})
</script>

<style scoped lang="scss">
.product-list-page {
  padding-top: $mall-spacing-md;
  padding-bottom: $mall-spacing-xl;
}

.breadcrumb {
  margin-bottom: $mall-spacing-md;
}

.page-body {
  display: flex;
  gap: $mall-spacing-md;
  align-items: flex-start;
}

// Sidebar
.sidebar {
  width: 220px;
  min-width: 220px;
  background: $mall-bg-white;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
  overflow: hidden;
  position: sticky;
  top: calc(#{$mall-header-height} + #{$mall-spacing-md});
}

.sidebar-title {
  padding: $mall-spacing-md;
  font-size: $mall-font-size-lg;
  font-weight: bold;
  color: $mall-text-primary;
  border-bottom: 1px solid $mall-border-color;
  background: $mall-bg-gray;
}

.category-list {
  max-height: 600px;
  overflow-y: auto;
}

.category-item {
  padding: $mall-spacing-sm $mall-spacing-md;
  cursor: pointer;
  font-size: $mall-font-size-base;
  color: $mall-text-secondary;
  transition: all 0.2s;
  border-bottom: 1px solid #ededed;

  &:hover {
    color: $mall-primary;
    background: rgba($mall-primary, 0.04);
  }

  &.active {
    color: $mall-primary;
    font-weight: 600;
    background: rgba($mall-primary, 0.06);
  }

  &.is-child {
    padding-left: $mall-spacing-lg + $mall-spacing-sm;
    font-size: $mall-font-size-sm;
  }
}

// Main Content
.main-content {
  flex: 1;
  min-width: 0;
}

// Sort Bar
.sort-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $mall-bg-white;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md $mall-radius-md 0 0;
  padding: 0;
  height: 44px;
}

.sort-options {
  display: flex;
  align-items: center;
  height: 100%;
}

.sort-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 20px;
  height: 100%;
  cursor: pointer;
  font-size: $mall-font-size-base;
  color: $mall-text-secondary;
  border-right: 1px solid $mall-border-color;
  transition: all 0.2s;
  user-select: none;

  &:hover {
    color: $mall-primary;
  }

  &.active {
    color: $mall-primary;
    font-weight: 600;
    background: rgba($mall-primary, 0.05);
  }
}

.sort-arrows {
  display: inline-flex;
  flex-direction: column;
  gap: 1px;

  .arrow-up,
  .arrow-down {
    display: block;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
  }

  .arrow-up {
    border-bottom: 4px solid $mall-text-muted;
  }

  .arrow-down {
    border-top: 4px solid $mall-text-muted;
  }
}

.price-range {
  display: flex;
  align-items: center;
  gap: $mall-spacing-xs;
  padding: 0 $mall-spacing-md;
}

.price-input {
  width: 80px;

  :deep(.el-input__inner) {
    text-align: center;
  }
}

.price-separator {
  color: $mall-text-muted;
}

// Product Grid
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $mall-spacing-sm;
  margin-top: $mall-spacing-sm;
}

// Skeleton Card
.product-card-skeleton {
  background: $mall-bg-white;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
  overflow: hidden;
}

// Product Card
.product-card {
  display: block;
  background: $mall-bg-white;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
  overflow: hidden;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;

  &:hover {
    box-shadow: $mall-shadow-md;
    transform: translateY(-2px);
    border-color: $mall-primary;
  }
}

.card-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: $mall-bg-gray;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }

  .product-card:hover & img {
    transform: scale(1.05);
  }
}

.card-info {
  padding: $mall-spacing-sm $mall-spacing-sm $mall-spacing-md;
}

.card-name {
  font-size: $mall-font-size-base;
  font-weight: normal;
  color: $mall-text-primary;
  line-height: 1.4;
  height: 2.8em;
  margin-bottom: $mall-spacing-xs;
}

.card-price-row {
  display: flex;
  align-items: baseline;
  gap: $mall-spacing-xs;
  margin-bottom: $mall-spacing-xs;
}

.card-price {
  font-size: $mall-font-size-lg;
}

.card-original-price {
  font-size: $mall-font-size-xs;
}

.card-sales {
  font-size: $mall-font-size-xs;
  color: $mall-text-muted;
}

// Pagination
.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: $mall-spacing-lg 0;
  background: $mall-bg-white;
  border: 1px solid $mall-border-color;
  border-top: none;
  border-radius: 0 0 $mall-radius-md $mall-radius-md;
  margin-top: $mall-spacing-sm;
}

// Responsive
@media (max-width: 1100px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 860px) {
  .sidebar {
    display: none;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
