import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getTradeConfig } from '@/api/trade/config'

export const useConfigStore = defineStore('mall-config', () => {
  const mallName = ref('HiveMart')
  const loaded = ref(false)

  async function loadConfig() {
    if (loaded.value) return
    try {
      const res = await getTradeConfig()
      if (res?.mallName) {
        mallName.value = res.mallName
      }
    } catch (e) {
      // ignore — keep default
    } finally {
      loaded.value = true
    }
  }

  return { mallName, loaded, loadConfig }
})
