<template>
  <div class="p-4 pb-24">
    <h1 class="text-2xl font-bold mb-6">Обычный таймер</h1>

    <!-- Список таймеров -->
    <div v-if="timersList.length > 0" class="space-y-3">
      <div
        v-for="timer in timersList"
        :key="timer.id"
        class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        @click="handleEditTimer(timer)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-semibold mb-2">{{ timer.name }}</h3>
            <p class="text-gray-600">
              {{ formatDuration(timer.duration) }}
            </p>
          </div>
          <div class="flex gap-2">
            <n-button
              quaternary
              type="primary"
              size="small"
              @click.stop="handleEditTimer(timer)"
            >
              Редактировать
            </n-button>
            <n-button
              quaternary
              type="error"
              size="small"
              @click.stop="handleDeleteTimer(timer.id)"
            >
              Удалить
            </n-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-else class="text-center py-12 text-gray-400">
      <p>Нет созданных таймеров</p>
      <p class="text-sm mt-2">Нажмите кнопку ниже, чтобы создать таймер</p>
    </div>

    <!-- Флоат кнопка -->
    <div
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
        class="shadow-lg"
        :style="{
          width: '56px',
          height: '56px',
        }"
        @click="showAddModal = true"
      >
      <template #icon>
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
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { NButton } from 'naive-ui';
import { useTimersStore } from '@/stores/timers';
import { useSafeArea } from '@/composables/useSafeArea';
import AddTimerModal from '@/components/timer/AddTimerModal.vue';

const router = useRouter();
const timersStore = useTimersStore();
const timersList = timersStore.timersList;
const showAddModal = ref(false);
const editingTimer = ref(null);
const { safeAreaInsets } = useSafeArea();

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

