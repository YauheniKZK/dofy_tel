<template>
  <div class="p-4 min-h-full">
    <h1 class="text-2xl font-bold mb-6">Главная</h1>

    <!-- Блок Режимы -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold mb-4">Режимы</h2>
      <div class="flex flex-col gap-3">
        <n-button type="primary" size="large" block @click="navigateToTimer">
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
import { useRouter } from "vue-router";
import { NButton } from "naive-ui";
import { useTimersStore } from "@/stores/timers";

const router = useRouter();
const timersStore = useTimersStore();

const navigateToTimer = () => {
  const lastTimer = timersStore.lastTimer;
  if (lastTimer) {
    router.push(`/timer/run/${lastTimer.id}`);
  } else {
    router.push("/timer");
  }
};

const navigateToWorkRestTimer = () => {
  router.push("/work-rest-timer");
};
</script>

<style scoped></style>
