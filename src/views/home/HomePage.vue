<template>
  <div class="home-page">
    <!-- Hero Banner Carousel -->
    <section class="banner-section">
      <div class="container">
        <el-carousel v-if="bannerList.length" height="400px" :interval="4000" arrow="hover">
          <el-carousel-item v-for="banner in bannerList" :key="banner.id">
            <a :href="banner.url" class="banner-link" target="_blank" rel="noopener">
              <img :src="banner.picUrl" :alt="banner.title" class="banner-img" />
            </a>
          </el-carousel-item>
        </el-carousel>
        <el-skeleton v-else-if="loading" :rows="8" animated />
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="section products-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">热门推荐</h2>
          <router-link to="/product/list" class="section-more">
            查看更多
            <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
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
        <el-skeleton v-else-if="loading" :rows="5" animated />
        <el-empty v-else description="暂无商品" :image-size="100" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import { getBannerList } from '@/api/promotion/banner'
import { getSpuPage } from '@/api/product/spu'
import type { Banner, ProductSpu } from '@/types'
import { fenToYuan } from '@/utils/price'

const bannerList = ref<Banner[]>([])
const productList = ref<ProductSpu[]>([])
const loading = ref(true)

/** Format price (fen to yuan) */
function formatPrice(price: number): string {
  return fenToYuan(price)
}

async function loadBanners() {
  try {
    bannerList.value = await getBannerList(1)
  } catch (e) {
    // ignore
  }
}

async function loadProducts() {
  try {
    const res = await getSpuPage({ pageNo: 1, pageSize: 8 })
    productList.value = res.list
  } catch (e) {
    // ignore
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([loadBanners(), loadProducts()])
  loading.value = false
})
</script>

<style scoped lang="scss">
.home-page {
  background: $mall-bg-gray;
}

// Banner
.banner-section {
  background: $mall-bg-white;
  padding: $mall-spacing-md 0;

  .container {
    border-radius: $mall-radius-md;
    overflow: hidden;
  }
}

.banner-link {
  display: block;
  width: 100%;
  height: 100%;
}

.banner-img {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

// Section common
.section {
  padding: $mall-spacing-lg 0;

  .container {
    background: $mall-bg-white;
    border-radius: $mall-radius-md;
    padding: $mall-spacing-lg;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $mall-spacing-lg;
  padding-bottom: $mall-spacing-md;
  border-bottom: 2px solid $mall-primary;
}

.section-title {
  font-size: $mall-font-size-xl;
  font-weight: 600;
  color: $mall-text-primary;
}

.section-more {
  display: flex;
  align-items: center;
  gap: $mall-spacing-xs;
  font-size: $mall-font-size-sm;
  color: $mall-text-muted;
  transition: color 0.2s;

  &:hover {
    color: $mall-primary;
  }
}

// Product grid
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
</style>
