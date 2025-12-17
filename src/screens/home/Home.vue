<template>
  <div class="p-4 min-h-full">
    <h1 class="text-2xl font-bold mb-6">Главная</h1>

    <!-- Блок Режимы -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold mb-4">Режимы</h2>
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
                class="text-sm mb-3"
                :class="isDark ? 'text-gray-400' : 'text-gray-600'"
              >
                Создавайте и запускайте таймеры с настраиваемым временем
              </p>
              <div
                v-if="lastTimer"
                class="flex items-center gap-2 text-xs"
                :class="isDark ? 'text-gray-500' : 'text-gray-500'"
              >
                <n-icon :component="TimeOutline" :size="14" />
                <span>Последний: {{ formatDuration(lastTimer.duration) }}</span>
              </div>
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
                class="text-sm mb-3"
                :class="isDark ? 'text-gray-400' : 'text-gray-600'"
              >
                Интервальный таймер для чередования периодов работы и отдыха
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
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { NIcon } from "naive-ui";
import { useTimersStore } from "@/stores/timers";
import {
  TimerOutline,
  RepeatOutline,
  ChevronForwardOutline,
  TimeOutline,
} from "@vicons/ionicons5";
import WebApp from "@twa-dev/sdk";

const router = useRouter();
const timersStore = useTimersStore();
const lastTimer = computed(() => timersStore.lastTimer);

const isDark = computed(() => {
  if (typeof WebApp !== "undefined" && WebApp.colorScheme) {
    return WebApp.colorScheme === "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
});

const formatDuration = (duration: {
  hours: number;
  minutes: number;
  seconds: number;
}) => {
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
  return parts.length > 0 ? parts.join(" ") : "0 сек";
};

const navigateToTimer = () => {
  if (lastTimer.value) {
    router.push(`/timer/run/${lastTimer.value.id}`);
  } else {
    router.push("/timer");
  }
};

const navigateToWorkRestTimer = () => {
  router.push("/work-rest-timer");
};
</script>

<style scoped></style>
