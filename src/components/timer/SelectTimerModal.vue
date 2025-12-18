<template>
  <n-drawer
    :show="showModal"
    :width="400"
    placement="bottom"
    :mask-closable="true"
    :height="600"
    @update:show="handleDrawerUpdate"
  >
    <n-drawer-content title="Выберите таймер" closable>
      <div class="flex flex-col h-full">
        <!-- Прокручиваемый контент -->
        <div class="flex-1 overflow-y-auto py-2">
          <div v-if="timersList.length > 0" class="space-y-3">
            <div
              v-for="timer in timersList"
              :key="timer.id"
              class="group relative rounded-xl p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-2"
              :class="[
                isDark
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-purple-500 shadow-lg hover:shadow-xl'
                  : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-purple-400 shadow-md hover:shadow-lg',
              ]"
              @click="handleSelectTimer(timer)"
            >
              <!-- Декоративный элемент -->
              <div
                class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20"
                :class="isDark ? 'bg-purple-500' : 'bg-purple-400'"
              ></div>
              
              <div class="relative flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <!-- Иконка таймера -->
                  <div class="flex items-center gap-3 mb-3">
                    <div
                      class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                      :class="isDark ? 'bg-purple-500/20' : 'bg-purple-100'"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :class="isDark ? 'text-purple-400' : 'text-purple-600'"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3
                        class="text-lg font-bold mb-1 truncate"
                        :class="isDark ? 'text-gray-100' : 'text-gray-900'"
                      >
                        {{ timer.name }}
                      </h3>
                    </div>
                  </div>
                  
                  <!-- Длительность -->
                  <div class="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      :class="isDark ? 'text-gray-400' : 'text-gray-500'"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <p
                      class="text-sm font-medium"
                      :class="isDark ? 'text-gray-300' : 'text-gray-600'"
                    >
                      {{ formatDuration(timer.duration) }}
                    </p>
                  </div>
                </div>
                
                <!-- Стрелка -->
                <div
                  class="ml-3 shrink-0 transition-transform group-hover:translate-x-1"
                  :class="isDark ? 'text-gray-500' : 'text-gray-400'"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div
              class="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              :class="isDark ? 'bg-gray-800' : 'bg-gray-100'"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                :class="isDark ? 'text-gray-600' : 'text-gray-400'"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <p
              class="text-lg font-semibold mb-2"
              :class="isDark ? 'text-gray-200' : 'text-gray-700'"
            >
              Нет сохраненных таймеров
            </p>
            <p
              class="text-sm max-w-sm"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            >
              Создайте таймер в разделе "Обычный таймер"
            </p>
          </div>
        </div>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NDrawer, NDrawerContent } from 'naive-ui';
import { useTimersStore } from '@/stores/timers';
import type { Timer } from '@/stores/timers';
import WebApp from '@twa-dev/sdk';

const props = defineProps<{
  showModal: boolean;
}>();

const emit = defineEmits<{
  close: [];
  select: [timer: Timer];
}>();

const timersStore = useTimersStore();
const timersList = timersStore.timersList;

const isDark = computed(() => {
  if (typeof WebApp !== 'undefined' && WebApp.colorScheme) {
    return WebApp.colorScheme === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
});

const formatDuration = (duration: { hours: number; minutes: number; seconds: number }) => {
  const parts: string[] = [];
  if (duration.hours > 0) {
    parts.push(`${duration.hours} ч`);
  }
  if (duration.minutes > 0) {
    parts.push(`${duration.minutes} мин`);
  }
  if (duration.seconds > 0) {
    parts.push(`${duration.seconds} сек`);
  }
  return parts.length > 0 ? parts.join(' ') : '0 сек';
};

const handleSelectTimer = (timer: Timer) => {
  emit('select', timer);
  handleClose();
};

const handleClose = () => {
  emit('close');
};

const handleDrawerUpdate = (show: boolean) => {
  if (!show) {
    handleClose();
  }
};
</script>

<style scoped></style>

