import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as CartApi from '@/api/trade/cart'
import type { CartItem } from '@/types'

export interface TaskForm {
  homeUrl: string
  duration: number
  taskExecMode: number
  scheduledTime: string | null
  execDays: number
  comments: string[]
}

const defaultTaskForm = (): TaskForm => ({
  homeUrl: '',
  duration: 1,
  taskExecMode: 1,
  scheduledTime: null,
  execDays: 1,
  comments: []
})

export const useCartStore = defineStore('mall-cart', () => {
  const list = ref<CartItem[]>([])
  const loading = ref(false)
  // Use plain object keyed by String(skuId) to avoid Map/type coercion issues
  const taskParamsRecord = ref<Record<string, TaskForm>>({})

  const validItems = computed(() => list.value.filter(item => {
    if (item.sku?.stock === undefined) return true
    return item.sku.stock === -1 || item.sku.stock > 0
  }))
  const selectedItems = computed(() => validItems.value.filter(item => item.selected))
  const totalPrice = computed(() => selectedItems.value.reduce((sum, item) => sum + item.sku.price * item.count, 0))
  const totalCount = computed(() => validItems.value.reduce((sum, item) => sum + item.count, 0))
  const selectedCount = computed(() => selectedItems.value.reduce((sum, item) => sum + item.count, 0))
  const allVirtual = computed(() =>
    selectedItems.value.length > 0 && selectedItems.value.every(item => {
      const types = item.spu?.deliveryTypes
      return types && types.length === 1 && types.includes(3)
    })
  )

  async function getList() {
    loading.value = true
    try {
      const res = await CartApi.getCartList()
      list.value = [...(res.validList || []), ...(res.invalidList || [])]
    } catch (e) {
      list.value = []
    } finally {
      loading.value = false
    }
  }

  async function addItem(skuId: number, count: number) {
    await CartApi.addCart({ skuId, count })
    await getList()
  }

  async function updateCount(id: number, count: number) {
    await CartApi.updateCartCount({ id, count })
    await getList()
  }

  async function updateSelected(id: number, selected: boolean) {
    await CartApi.updateCartSelected({ ids: [id], selected })
    await getList()
  }

  async function updateAllSelected(selected: boolean) {
    const ids = validItems.value.filter(item => item.selected !== selected).map(item => item.id)
    if (ids.length === 0) return
    await CartApi.updateCartSelected({ ids, selected })
    await getList()
  }

  async function deleteItems(ids: number[]) {
    await CartApi.deleteCartItems(ids)
    await getList()
  }

  function setTaskParams(skuId: number | string, params: TaskForm) {
    taskParamsRecord.value[String(skuId)] = { ...params }
  }

  function getTaskParams(skuId: number | string): TaskForm {
    const key = String(skuId)
    return taskParamsRecord.value[key] ? { ...taskParamsRecord.value[key] } : defaultTaskForm()
  }

  function removeTaskParams(skuId: number | string) {
    delete taskParamsRecord.value[String(skuId)]
  }

  return {
    list,
    loading,
    taskParamsRecord,
    validItems,
    selectedItems,
    totalPrice,
    totalCount,
    selectedCount,
    allVirtual,
    getList,
    addItem,
    updateCount,
    updateSelected,
    updateAllSelected,
    deleteItems,
    setTaskParams,
    getTaskParams,
    removeTaskParams
  }
})
