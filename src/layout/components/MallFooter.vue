<template>
  <footer class="mall-footer">
    <div class="container footer-inner">
      <p>&copy; {{ year }} {{ configStore.mallName }}. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useConfigStore } from '@/store/modules/config'

const configStore = useConfigStore()
const year = new Date().getFullYear()
</script>

<style scoped lang="scss">
.mall-footer {
  background: $mall-footer-bg;
  color: #ccc;
  margin-top: $mall-spacing-xl;
}
.footer-inner {
  padding: $mall-spacing-md 0;
  text-align: center;
  font-size: $mall-font-size-xs;
}
</style>
