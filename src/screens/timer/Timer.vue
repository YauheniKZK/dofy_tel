<template>
  <div class="p-4 pb-24 min-h-full">
    <!-- Заголовок -->
    <div class="mb-6">
      <h1
        class="text-2xl font-bold mb-2"
        :class="isDark ? 'text-gray-100' : 'text-gray-900'"
      >
        Обычный таймер
      </h1>
      <p
        v-if="timersList.length > 0"
        class="text-sm"
        :class="isDark ? 'text-gray-400' : 'text-gray-600'"
      >
        У вас {{ timersList.length }} {{ getTimerWord(timersList.length) }}
      </p>
    </div>

    <!-- Список таймеров -->
    <div v-if="timersList.length > 0" class="space-y-4">
      <div
        v-for="timer in timersList"
        :key="timer.id"
        class="rounded-xl p-5 border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
        :class="
          isDark
            ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
            : 'bg-white border-gray-200 hover:border-blue-400 shadow-sm'
        "
      >
        <div class="flex items-start gap-4">
          <!-- Иконка таймера -->
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

          <!-- Информация о таймере -->
          <div class="flex-1 min-w-0" @click="handleEditTimer(timer)">
            <h3
              class="text-lg font-semibold mb-2"
              :class="isDark ? 'text-gray-100' : 'text-gray-900'"
            >
              {{ timer.name }}
            </h3>
            <div class="flex items-center gap-2">
              <n-icon
                :component="TimeOutline"
                :size="16"
                :class="isDark ? 'text-gray-500' : 'text-gray-400'"
              />
              <p
                class="text-sm font-medium"
                :class="isDark ? 'text-gray-400' : 'text-gray-600'"
              >
                {{ formatDuration(timer.duration) }}
              </p>
            </div>
          </div>

          <!-- Действия -->
          <div class="flex gap-2 shrink-0">
            <n-button
              circle
              size="medium"
              type="primary"
              :class="isDark ? 'shadow-lg' : ''"
              @click.stop="handleStartTimer(timer)"
            >
              <template #icon>
                <n-icon :component="PlayCircleOutline" :size="20" />
              </template>
            </n-button>
            <n-button
              circle
              size="medium"
              :type="isDark ? 'default' : 'default'"
              @click.stop="handleEditTimer(timer)"
            >
              <template #icon>
                <n-icon :component="CreateOutline" :size="18" />
              </template>
            </n-button>
            <n-button
              circle
              size="medium"
              type="error"
              @click.stop="handleDeleteTimer(timer.id)"
            >
              <template #icon>
                <n-icon :component="TrashOutline" :size="18" />
              </template>
            </n-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div
        class="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        :class="isDark ? 'bg-gray-800' : 'bg-gray-100'"
      >
        <n-icon
          :component="TimerOutline"
          :size="40"
          :class="isDark ? 'text-gray-600' : 'text-gray-400'"
        />
      </div>
      <h3
        class="text-lg font-semibold mb-2"
        :class="isDark ? 'text-gray-200' : 'text-gray-700'"
      >
        Нет созданных таймеров
      </h3>
      <p
        class="text-sm mb-6 max-w-sm"
        :class="isDark ? 'text-gray-400' : 'text-gray-500'"
      >
        Создайте свой первый таймер, нажав на кнопку внизу экрана
      </p>
      <n-button
        type="primary"
        size="large"
        @click="showAddModal = true"
      >
        <template #icon>
          <n-icon :component="AddCircleOutline" />
        </template>
        Создать таймер
      </n-button>
    </div>

    <!-- Флоат кнопка -->
    <div
      v-if="timersList.length > 0"
      class="fixed z-50"
      :style="{
        bottom: `${64 + safeAreaInsets.bottom + 16}px`,
        right: `${16 + safeAreaInsets.right}px`,
      }"
    >
      <n-button
        type="primary"
        size="large"
        circle
        class="shadow-xl hover:shadow-2xl transition-shadow"
        :style="{
          width: '56px',
          height: '56px',
        }"
        @click="showAddModal = true"
      >
        <template #icon>
          <n-icon :component="AddCircleOutline" :size="24" />
        </template>
      </n-button>
    </div>

    <!-- Модальное окно добавления/редактирования таймера -->
    <AddTimerModal
      :show-modal="showAddModal"
      :editing-timer="editingTimer"
      @close="handleCloseModal"
      @save="handleAddTimer"
      @update="handleUpdateTimer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { NButton, NIcon } from 'naive-ui';
import { useTimersStore } from '@/stores/timers';
import { useSafeArea } from '@/composables/useSafeArea';
import AddTimerModal from '@/components/timer/AddTimerModal.vue';
import {
  TimerOutline,
  TimeOutline,
  PlayCircleOutline,
  CreateOutline,
  TrashOutline,
  AddCircleOutline,
} from '@vicons/ionicons5';
import WebApp from '@twa-dev/sdk';

const router = useRouter();
const timersStore = useTimersStore();
const timersList = timersStore.timersList;
const showAddModal = ref(false);
const editingTimer = ref(null);
const { safeAreaInsets } = useSafeArea();

const isDark = computed(() => {
  if (typeof WebApp !== 'undefined' && WebApp.colorScheme) {
    return WebApp.colorScheme === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
});

const getTimerWord = (count: number) => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'таймеров';
  }
  
  if (lastDigit === 1) {
    return 'таймер';
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'таймера';
  }
  
  return 'таймеров';
};

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
  return parts.length > 0 ? parts.join(' ') : '0 сек';
};

const handleAddTimer = (timer: {
  name: string;
  duration: { hours: number; minutes: number; seconds: number };
}) => {
  timersStore.addTimer(timer);
};

const handleUpdateTimer = (id: string, timer: {
  name: string;
  duration: { hours: number; minutes: number; seconds: number };
}) => {
  timersStore.updateTimer(id, timer);
};

const handleStartTimer = (timer: any) => {
  router.push(`/timer/run/${timer.id}`);
};

const handleEditTimer = (timer: any) => {
  editingTimer.value = timer;
  showAddModal.value = true;
};

const handleCloseModal = () => {
  showAddModal.value = false;
  editingTimer.value = null;
};

const handleDeleteTimer = (id: string) => {
  timersStore.deleteTimer(id);
};
</script>

<style scoped></style>

