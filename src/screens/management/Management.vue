<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-6">Управление</h1>
    
    <div class="mb-6">
      <h2 class="text-lg font-semibold mb-4">Режимы</h2>
      <div class="flex flex-col gap-3">
        <n-button
          type="primary"
          size="large"
          block
          @click="navigateToTimer"
        >
          Обычный таймер
        </n-button>
        <n-button
          type="primary"
          size="large"
          block
          @click="navigateToWorkRestTimer"
        >
          Таймер Работа-отдых
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { NButton } from 'naive-ui';

const router = useRouter();

const navigateToTimer = () => {
  router.push('/timer');
};

const navigateToWorkRestTimer = () => {
  router.push('/work-rest-timer');
};
</script>

<style scoped></style>

