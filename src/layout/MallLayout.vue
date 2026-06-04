<template>
  <div class="mall-layout">
    <MallHeader />
    <main class="mall-main">
      <router-view />
    </main>
    <MallFooter />
  </div>
</template>

<script setup lang="ts">
import MallHeader from './components/MallHeader.vue'
import MallFooter from './components/MallFooter.vue'
</script>

<style scoped lang="scss">
.mall-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.mall-main {
  flex: 1;
  padding-top: $mall-header-height;
}
</style>
