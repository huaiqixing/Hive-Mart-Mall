<template>
  <div class="category-page">
    <div class="container category-layout">
      <!-- Left Sidebar: Category Tree -->
      <aside class="category-sidebar">
        <h3 class="sidebar-title">全部分类</h3>
        <el-scrollbar max-height="calc(100vh - 180px)">
          <ul class="category-tree">
            <li
              v-for="cat in categoryList"
              :key="cat.id"
              class="category-tree-item"
              :class="{ active: selectedCategoryId === cat.id }"
            >
              <div class="category-tree-label" @click="selectCategory(cat)">
                <span>{{ cat.name }}</span>
                <el-icon v-if="cat.children?.length" :size="12">
                  <ArrowRight />
                </el-icon>
              </div>
              <!-- Children -->
              <ul v-if="cat.children?.length && isCategoryExpanded(cat.id)" class="category-children">
                <li
                  v-for="child in cat.children"
                  :key="child.id"
                  class="category-child-item"
                  :class="{ active: selectedCategoryId === child.id }"
                  @click="selectCategory(child)"
                >
                  {{ child.name }}
                </li>
              </ul>
            </li>
          </ul>
        </el-scrollbar>
      </aside>

      <!-- Right Content: Product Grid -->
      <main class="category-content">
        <!-- Breadcrumb -->
        <el-breadcrumb v-if="currentCategory" separator="/" class="content-breadcrumb">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-if="parentCategory">{{ parentCategory.name }}</el-breadcrumb-item>
          <el-breadcrumb-item>{{ currentCategory.name }}</el-breadcrumb-item>
        </el-breadcrumb>

        <h2 v-if="currentCategory" class="content-title">{{ currentCategory.name }}</h2>
        <h2 v-else class="content-title">全部分类</h2>

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

        <el-empty v-else-if="!loading" description="暂无商品" />

        <!-- Pagination -->
        <div v-if="total > pageSize" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pageNo"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            background
            @current-change="loadProducts"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import { getSpuPage } from '@/api/product/spu'
import { useAppStore } from '@/store/modules/app'
import type { Category, ProductSpu } from '@/types'
import { fenToYuan } from '@/utils/price'

const route = useRoute()
const appStore = useAppStore()

const selectedCategoryId = ref<number | undefined>(undefined)
const expandedIds = ref<Set<number>>(new Set())
const productList = ref<ProductSpu[]>([])
const pageNo = ref(1)
const pageSize = 20
const total = ref(0)
const loading = ref(false)

const categoryList = computed<Category[]>(() => appStore.categoryList)

/** Find the currently selected category object */
const currentCategory = computed<Category | undefined>(() => {
  if (!selectedCategoryId.value) return undefined
  return findCategoryById(categoryList.value, selectedCategoryId.value)
})

/** Find the parent of the currently selected category */
const parentCategory = computed<Category | undefined>(() => {
  if (!selectedCategoryId.value) return undefined
  return findParentCategory(categoryList.value, selectedCategoryId.value)
})

function formatPrice(price: number): string {
  return fenToYuan(price)
}

/** Recursively find a category by id */
function findCategoryById(categories: Category[], id: number): Category | undefined {
  for (const cat of categories) {
    if (cat.id === id) return cat
    if (cat.children) {
      const found = findCategoryById(cat.children, id)
      if (found) return found
    }
  }
  return undefined
}

/** Find the parent category of a given id */
function findParentCategory(categories: Category[], childId: number): Category | undefined {
  for (const cat of categories) {
    if (cat.children?.some((c) => c.id === childId)) return cat
    if (cat.children) {
      const found = findParentCategory(cat.children, childId)
      if (found) return found
    }
  }
  return undefined
}

function isCategoryExpanded(id: number): boolean {
  return expandedIds.value.has(id)
}

function selectCategory(cat: Category) {
  selectedCategoryId.value = cat.id
  pageNo.value = 1

  // Toggle expanded state for parent categories
  if (cat.children?.length) {
    if (expandedIds.value.has(cat.id)) {
      expandedIds.value.delete(cat.id)
    } else {
      expandedIds.value.add(cat.id)
    }
  }

  loadProducts()
}

async function loadProducts() {
  loading.value = true
  try {
    const params: Record<string, any> = {
      pageNo: pageNo.value,
      pageSize
    }
    if (selectedCategoryId.value) {
      params.categoryId = selectedCategoryId.value
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

/** Parse categoryId from route query on mount */
function initFromRoute() {
  const catId = route.query.categoryId
  if (catId) {
    const id = Number(catId)
    if (!isNaN(id)) {
      selectedCategoryId.value = id
      // Expand the parent of this category
      const parent = findParentCategory(categoryList.value, id)
      if (parent) {
        expandedIds.value.add(parent.id)
      }
    }
  }
}

onMounted(async () => {
  await appStore.loadCategories()
  initFromRoute()
  await loadProducts()
})

// Re-initialize if route query changes
watch(
  () => route.query.categoryId,
  () => {
    initFromRoute()
    pageNo.value = 1
    loadProducts()
  }
)
</script>

<style scoped lang="scss">
.category-page {
  padding: $mall-spacing-md 0;
  min-height: calc(100vh - #{$mall-header-height} - 200px);
}

.category-layout {
  display: flex;
  gap: $mall-spacing-md;
  align-items: flex-start;
}

// Sidebar
.category-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: $mall-bg-white;
  border-radius: $mall-radius-md;
  padding: $mall-spacing-md;
  position: sticky;
  top: calc(#{$mall-header-height} + #{$mall-spacing-md});
}

.sidebar-title {
  font-size: $mall-font-size-lg;
  font-weight: 600;
  color: $mall-text-primary;
  padding-bottom: $mall-spacing-md;
  border-bottom: 1px solid $mall-border-color;
  margin-bottom: $mall-spacing-sm;
}

.category-tree {
  // list already reset by global reset
}

.category-tree-item {
  margin-bottom: 2px;
}

.category-tree-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $mall-spacing-sm $mall-spacing-sm;
  font-size: $mall-font-size-base;
  color: $mall-text-primary;
  border-radius: $mall-radius-sm;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: $mall-bg-gray;
    color: $mall-primary;
  }

  .category-tree-item.active > & {
    color: $mall-primary;
    font-weight: 600;
    background: rgba($mall-primary, 0.06);
  }
}

.category-children {
  padding-left: $mall-spacing-md;
}

.category-child-item {
  padding: $mall-spacing-xs $mall-spacing-sm;
  font-size: $mall-font-size-sm;
  color: $mall-text-secondary;
  border-radius: $mall-radius-sm;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: $mall-primary;
    background: $mall-bg-gray;
  }

  &.active {
    color: $mall-primary;
    font-weight: 600;
  }
}

// Content
.category-content {
  flex: 1;
  min-width: 0;
  background: $mall-bg-white;
  border-radius: $mall-radius-md;
  padding: $mall-spacing-lg;
}

.content-breadcrumb {
  margin-bottom: $mall-spacing-md;
}

.content-title {
  font-size: $mall-font-size-xl;
  font-weight: 600;
  color: $mall-text-primary;
  margin-bottom: $mall-spacing-lg;
  padding-bottom: $mall-spacing-md;
  border-bottom: 2px solid $mall-primary;
}

// Product grid (same as HomePage)
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $mall-spacing-md;
}

.product-card {
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

// Pagination
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: $mall-spacing-lg 0 0;
}
</style>
