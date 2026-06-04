import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as CategoryApi from '@/api/product/category'
import type { Category } from '@/types'

export const useAppStore = defineStore('mall-app', () => {
  const categoryList = ref<Category[]>([])
  const categoryLoaded = ref(false)

  async function loadCategories() {
    if (categoryLoaded.value) return
    try {
      categoryList.value = await CategoryApi.getCategoryList()
      categoryLoaded.value = true
    } catch (e) {
      // ignore
    }
  }

  return {
    categoryList,
    loadCategories
  }
})
