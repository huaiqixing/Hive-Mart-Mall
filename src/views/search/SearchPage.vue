<template>
  <div class="search-page">
    <div class="container">
      <!-- Search Bar -->
      <div class="search-bar">
        <el-input
          v-model="keyword"
          placeholder="搜索商品"
          size="large"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>

      <!-- Sort Bar -->
      <div class="sort-bar">
        <div
          v-for="option in sortOptions"
          :key="option.field"
          class="sort-item"
          :class="{ active: currentSort === option.field }"
          @click="changeSort(option.field)"
        >
          {{ option.label }}
          <template v-if="option.field === 'price' && currentSort === 'price'">
            <el-icon :size="12">
              <ArrowUp v-if="sortAsc" />
              <ArrowDown v-else />
            </el-icon>
          </template>
        </div>
        <span class="result-count">共 {{ total }} 件商品</span>
      </div>

      <!-- Product Grid -->
      <div v-if="productList.length" class="product-grid">
        <div v-for="product in productList" :key="product.id" class="product-card">
          <router-link :to="`/product/${product.id}`" class="product-link">
            <div class="product-image">
              <img :src="product.picUrl" :alt="product.name" />
            </div>
            <div class="product-info">
              <h3 class="product-name ellipsis-2">{{ product.name }}</h3>
              <div class="product-bottom">
                <span class="price">{{ formatPrice(product.price) }}</span>
                <span class="product-sales">{{ product.salesCount }}人付款</span>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <el-empty v-else-if="!loading" description="未找到相关商品">
        <el-button type="primary" @click="keyword = ''; handleSearch()">查看全部商品</el-button>
      </el-empty>

      <!-- Loading -->
      <div v-if="loading" class="loading-wrapper">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- Pagination -->
      <div v-if="total > pageSize" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pageNo"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next, jumper"
          background
          @current-change="loadProducts"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { getSpuPage } from '@/api/product/spu'
import type { ProductSpu } from '@/types'
import { fenToYuan } from '@/utils/price'

const route = useRoute()
const router = useRouter()

const keyword = ref('')
const productList = ref<ProductSpu[]>([])
const pageNo = ref(1)
const pageSize = 20
const total = ref(0)
const loading = ref(false)
const currentSort = ref<string>('')
const sortAsc = ref(true)

const sortOptions = [
  { label: '综合', field: '' },
  { label: '价格', field: 'price' },
  { label: '销量', field: 'salesCount' }
]

function formatPrice(price: number): string {
  return fenToYuan(price)
}

function handleSearch() {
  pageNo.value = 1
  // Update URL query to reflect current keyword
  router.replace({
    path: '/search',
    query: keyword.value ? { keyword: keyword.value } : {}
  })
  loadProducts()
}

function changeSort(field: string) {
  if (currentSort.value === field && field === 'price') {
    // Toggle direction for price sort
    sortAsc.value = !sortAsc.value
  } else {
    currentSort.value = field
    sortAsc.value = true
  }
  pageNo.value = 1
  loadProducts()
}

async function loadProducts() {
  loading.value = true
  try {
    const params: Record<string, any> = {
      pageNo: pageNo.value,
      pageSize
    }
    if (keyword.value) {
      params.keyword = keyword.value
    }
    if (currentSort.value) {
      params.sortField = currentSort.value
      params.sortAsc = sortAsc.value
    }
    const res = await getSpuPage(params)
    productList.value = res.list
    total.value = res.total
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
}

/** Initialize keyword from route query */
function initFromRoute() {
  const q = route.query.keyword
  if (q && typeof q === 'string') {
    keyword.value = q
  }
}

onMounted(() => {
  initFromRoute()
  loadProducts()
})

// Re-search when route query changes
watch(
  () => route.query.keyword,
  (newKeyword) => {
    if (typeof newKeyword === 'string' && newKeyword !== keyword.value) {
      keyword.value = newKeyword
      pageNo.value = 1
      currentSort.value = ''
      loadProducts()
    }
  }
)
</script>

<style scoped lang="scss">
.search-page {
  padding: $mall-spacing-md 0;
  min-height: calc(100vh - #{$mall-header-height} - 200px);
}

.search-bar {
  background: $mall-bg-white;
  padding: $mall-spacing-lg;
  border-radius: $mall-radius-md;
  margin-bottom: $mall-spacing-md;
}

.search-input {
  max-width: 680px;

  :deep(.el-input-group__append) {
    background: $mall-primary;
    border-color: $mall-primary;
    color: #fff;
    cursor: pointer;

    &:hover {
      background: $mall-primary-light;
      border-color: $mall-primary-light;
    }
  }
}

// Sort bar
.sort-bar {
  display: flex;
  align-items: center;
  gap: 0;
  background: $mall-bg-white;
  border-radius: $mall-radius-md $mall-radius-md 0 0;
  border-bottom: 2px solid $mall-border-color;
  margin-bottom: $mall-spacing-md;
}

.sort-item {
  padding: $mall-spacing-md $mall-spacing-lg;
  font-size: $mall-font-size-base;
  color: $mall-text-secondary;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  display: flex;
  align-items: center;
  gap: $mall-spacing-xs;

  &:hover {
    color: $mall-primary;
  }

  &.active {
    color: $mall-primary;
    font-weight: 600;
    border-bottom: 2px solid $mall-primary;
    margin-bottom: -2px;
  }
}

.result-count {
  margin-left: auto;
  padding-right: $mall-spacing-md;
  font-size: $mall-font-size-sm;
  color: $mall-text-muted;
}

// Product grid
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $mall-spacing-md;
}

.product-card {
  background: $mall-bg-white;
  border-radius: $mall-radius-md;
  overflow: hidden;
  transition: box-shadow 0.3s, transform 0.3s;

  &:hover {
    box-shadow: $mall-shadow-lg;
    transform: translateY(-2px);
  }
}

.product-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.product-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: $mall-bg-gray;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;

    .product-card:hover & {
      transform: scale(1.05);
    }
  }
}

.product-info {
  padding: $mall-spacing-sm $mall-spacing-sm $mall-spacing-md;
}

.product-name {
  font-size: $mall-font-size-base;
  font-weight: 400;
  color: $mall-text-primary;
  line-height: 1.4;
  height: 2.8em;
  margin-bottom: $mall-spacing-sm;
}

.product-bottom {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.product-sales {
  font-size: $mall-font-size-xs;
  color: $mall-text-muted;
}

// Loading
.loading-wrapper {
  background: $mall-bg-white;
  border-radius: $mall-radius-md;
  padding: $mall-spacing-lg;
}

// Pagination
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: $mall-spacing-lg 0;
}
</style>
