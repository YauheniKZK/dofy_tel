<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useSafeArea } from '@/composables/useSafeArea';

const { safeAreaInsets } = useSafeArea();
</script>

<template>
  <div 
    class="flex flex-col grow h-full overflow-hidden"
    :style="{
      paddingTop: `${16 + safeAreaInsets.top}px`,
    }"
  >
    <RouterView class="flex flex-col grow h-full overflow-hidden" />
  </div>
</template>

<style scoped></style>
