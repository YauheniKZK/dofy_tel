<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useSafeArea } from '@/composables/useSafeArea';

const { safeAreaInsets } = useSafeArea();
</script>

<template>
  <div 
    class="flex flex-col grow"
    :style="{
      paddingTop: `${16 + safeAreaInsets.top}px`,
    }"
  >
    <RouterView class="flex flex-col grow" />
  </div>
</template>

<style scoped></style>
