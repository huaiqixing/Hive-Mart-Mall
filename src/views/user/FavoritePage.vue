<template>
  <div class="favorite-page">
    <h3 class="section-title">我的收藏</h3>

    <!-- Product Grid -->
    <div class="favorite-grid" v-if="favoriteList.length > 0">
      <div v-for="product in favoriteList" :key="product.id" class="favorite-card">
        <router-link :to="`/product/${product.spuId}`" class="card-link">
          <el-image class="card-img" :src="product.picUrl" fit="cover" />
          <div class="card-info">
            <p class="card-name ellipsis-2">{{ product.name }}</p>
            <div class="card-price">
              <span class="price">{{ fenToYuan(product.price) }}</span>
              <span v-if="product.marketPrice > product.price" class="price-original">
                {{ fenToYuan(product.marketPrice) }}
              </span>
            </div>
          </div>
        </router-link>
        <div class="card-actions">
          <el-button
            type="danger"
            :icon="StarFilled"
            circle
            size="small"
            @click="handleUnfavorite(product.spuId)"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <el-empty v-else-if="!loading" description="暂无收藏商品">
      <el-button type="primary" @click="$router.push('/')">去逛逛</el-button>
    </el-empty>

    <!-- Pagination -->
    <div class="pagination-wrap" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="pageNo"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="loadFavorites"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { StarFilled } from '@element-plus/icons-vue'
import { getFavoritePage, deleteFavorite } from '@/api/product/favorite'
import type { ProductSpu } from '@/types'
import { fenToYuan } from '@/utils/price'

const favoriteList = ref<ProductSpu[]>([])
const loading = ref(false)
const pageNo = ref(1)
const pageSize = 12
const total = ref(0)

async function loadFavorites() {
  loading.value = true
  try {
    const res = await getFavoritePage({ pageNo: pageNo.value, pageSize })
    favoriteList.value = res.list
    total.value = res.total
  } catch {
    favoriteList.value = []
  } finally {
    loading.value = false
  }
}

async function handleUnfavorite(spuId: number) {
  try {
    await ElMessageBox.confirm('确定要取消收藏吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteFavorite(spuId)
    ElMessage.success('已取消收藏')
    loadFavorites()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  loadFavorites()
})
</script>

<style scoped lang="scss">
.favorite-page {
  //
}

.section-title {
  font-size: $mall-font-size-lg;
  color: $mall-text-primary;
  font-weight: 600;
  margin: 0 0 $mall-spacing-lg;
  padding-bottom: $mall-spacing-md;
  border-bottom: 1px solid $mall-border-color;
}

.favorite-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: $mall-spacing-md;
}

.favorite-card {
  position: relative;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
  overflow: hidden;
  background: $mall-bg-white;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: $mall-shadow-md;

    .card-actions {
      opacity: 1;
    }
  }
}

.card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.card-img {
  width: 100%;
  aspect-ratio: 1;
  display: block;
}

.card-info {
  padding: $mall-spacing-sm $mall-spacing-md $mall-spacing-md;

  .card-name {
    font-size: $mall-font-size-sm;
    color: $mall-text-primary;
    line-height: 1.5;
    height: 36px;
    margin-bottom: $mall-spacing-sm;
  }

  .card-price {
    display: flex;
    align-items: baseline;
    gap: $mall-spacing-sm;

    .price-original {
      font-size: $mall-font-size-xs;
    }
  }
}

.card-actions {
  position: absolute;
  top: $mall-spacing-sm;
  right: $mall-spacing-sm;
  opacity: 0;
  transition: opacity 0.2s;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: $mall-spacing-lg 0;
}
</style>
