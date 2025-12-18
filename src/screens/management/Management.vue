<template>
  <div class="p-4 min-h-full">
    <h1
      class="text-2xl font-bold mb-6"
      :class="isDark ? 'text-gray-100' : 'text-gray-900'"
    >
      Управление
    </h1>

    <!-- Блок Режимы таймеров -->
    <div class="mb-6">
      <h2
        class="text-lg font-semibold mb-4"
        :class="isDark ? 'text-gray-200' : 'text-gray-800'"
      >
        Режимы таймеров
      </h2>
      <div class="grid grid-cols-1 gap-4">
        <!-- Карточка обычного таймера -->
        <div
          class="rounded-xl p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg border"
          :class="
            isDark
              ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
              : 'bg-white border-gray-200 hover:border-blue-400 shadow-sm'
          "
          @click="navigateToTimer"
        >
          <div class="flex items-start gap-4">
            <div
              class="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
              :class="isDark ? 'bg-blue-500/20' : 'bg-blue-100'"
            >
              <n-icon
                :component="TimerOutline"
                :size="24"
                :class="isDark ? 'text-blue-400' : 'text-blue-600'"
              />
            </div>
            <div class="flex-1 min-w-0">
              <h3
                class="text-lg font-semibold mb-1"
                :class="isDark ? 'text-gray-100' : 'text-gray-900'"
              >
                Обычный таймер
              </h3>
              <p
                class="text-sm"
                :class="isDark ? 'text-gray-400' : 'text-gray-600'"
              >
                Управление обычными таймерами: создание, редактирование и удаление
              </p>
            </div>
            <n-icon
              :component="ChevronForwardOutline"
              :size="20"
              :class="isDark ? 'text-gray-500' : 'text-gray-400'"
            />
          </div>
        </div>

        <!-- Карточка таймера работа-отдых -->
        <div
          class="rounded-xl p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg border"
          :class="
            isDark
              ? 'bg-gray-800 border-gray-700 hover:border-green-500'
              : 'bg-white border-gray-200 hover:border-green-400 shadow-sm'
          "
          @click="navigateToWorkRestTimer"
        >
          <div class="flex items-start gap-4">
            <div
              class="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
              :class="isDark ? 'bg-green-500/20' : 'bg-green-100'"
            >
              <n-icon
                :component="RepeatOutline"
                :size="24"
                :class="isDark ? 'text-green-400' : 'text-green-600'"
              />
            </div>
            <div class="flex-1 min-w-0">
              <h3
                class="text-lg font-semibold mb-1"
                :class="isDark ? 'text-gray-100' : 'text-gray-900'"
              >
                Таймер Работа-отдых
              </h3>
              <p
                class="text-sm"
                :class="isDark ? 'text-gray-400' : 'text-gray-600'"
              >
                Настройка интервального таймера с периодами работы и отдыха
              </p>
            </div>
            <n-icon
              :component="ChevronForwardOutline"
              :size="20"
              :class="isDark ? 'text-gray-500' : 'text-gray-400'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Блок Быстрые действия -->
    <div class="mb-6">
      <h2
        class="text-lg font-semibold mb-4"
        :class="isDark ? 'text-gray-200' : 'text-gray-800'"
      >
        Быстрые действия
      </h2>
      <div class="grid grid-cols-2 gap-3">
        <!-- Создать новый таймер -->
        <div
          class="rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg border text-center"
          :class="
            isDark
              ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
              : 'bg-white border-gray-200 hover:border-purple-400 shadow-sm'
          "
          @click="navigateToTimer"
        >
          <div
            class="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
            :class="isDark ? 'bg-purple-500/20' : 'bg-purple-100'"
          >
            <n-icon
              :component="AddCircleOutline"
              :size="20"
              :class="isDark ? 'text-purple-400' : 'text-purple-600'"
            />
          </div>
          <h3
            class="text-sm font-semibold"
            :class="isDark ? 'text-gray-100' : 'text-gray-900'"
          >
            Создать таймер
          </h3>
        </div>

        <!-- Статистика -->
        <div
          class="rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg border text-center"
          :class="
            isDark
              ? 'bg-gray-800 border-gray-700 hover:border-orange-500'
              : 'bg-white border-gray-200 hover:border-orange-400 shadow-sm'
          "
          @click="navigateToStats"
        >
          <div
            class="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
            :class="isDark ? 'bg-orange-500/20' : 'bg-orange-100'"
          >
            <n-icon
              :component="StatsChartOutline"
              :size="20"
              :class="isDark ? 'text-orange-400' : 'text-orange-600'"
            />
          </div>
          <h3
            class="text-sm font-semibold"
            :class="isDark ? 'text-gray-100' : 'text-gray-900'"
          >
            Статистика
          </h3>
        </div>
      </div>
    </div>

    <!-- Информация о таймерах -->
    <div
      v-if="timersCount > 0"
      class="rounded-xl p-4 border"
      :class="
        isDark
          ? 'bg-gray-800/50 border-gray-700'
          : 'bg-gray-50 border-gray-200'
      "
    >
      <div class="flex items-center justify-between">
        <div>
          <p
            class="text-sm font-medium mb-1"
            :class="isDark ? 'text-gray-300' : 'text-gray-700'"
          >
            Всего таймеров
          </p>
          <p
            class="text-2xl font-bold"
            :class="isDark ? 'text-gray-100' : 'text-gray-900'"
          >
            {{ timersCount }}
          </p>
        </div>
        <div
          class="w-12 h-12 rounded-lg flex items-center justify-center"
          :class="isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'"
        >
          <n-icon
            :component="ListOutline"
            :size="24"
            :class="isDark ? 'text-indigo-400' : 'text-indigo-600'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { NIcon } from 'naive-ui';
import {
  TimerOutline,
  RepeatOutline,
  ChevronForwardOutline,
  AddCircleOutline,
  StatsChartOutline,
  ListOutline,
} from '@vicons/ionicons5';
import WebApp from '@twa-dev/sdk';
import { useTimersStore } from '@/stores/timers';

const router = useRouter();
const timersStore = useTimersStore();

const isDark = computed(() => {
  if (typeof WebApp !== 'undefined' && WebApp.colorScheme) {
    return WebApp.colorScheme === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
});

const timersCount = computed(() => timersStore.timersList.length);

const navigateToTimer = () => {
  router.push('/timer');
};

const navigateToWorkRestTimer = () => {
  router.push('/work-rest-timer');
};

const navigateToStats = () => {
  router.push('/stats');
};
</script>

<style scoped></style>

