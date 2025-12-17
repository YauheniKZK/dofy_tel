<template>
  <ModalDialog :show-modal="showModal" @close="handleClose">
    <template #content>
      <div class="flex flex-col h-full max-h-[80vh]">
        <div class="flex-1 overflow-y-auto py-4">
          <h2 class="text-xl font-bold mb-4">Выберите таймер</h2>

          <div v-if="timersList.length > 0" class="space-y-3">
            <div
              v-for="timer in timersList"
              :key="timer.id"
              class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              @click="handleSelectTimer(timer)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold mb-2">{{ timer.name }}</h3>
                  <p class="text-gray-600">
                    {{ formatDuration(timer.duration) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12 text-gray-400">
            <p>Нет сохраненных таймеров</p>
            <p class="text-sm mt-2">Создайте таймер в разделе "Обычный таймер"</p>
          </div>
        </div>

        <div class="flex flex-col gap-3 pt-4 pb-2 border-t border-gray-200 bg-white sticky bottom-0 -mx-4 px-4 mt-4">
          <n-button block size="large" @click="handleClose">
            Отмена
          </n-button>
        </div>
      </div>
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui';
import ModalDialog from '@/components/ui/ModalDialog.vue';
import { useTimersStore } from '@/stores/timers';
import type { Timer } from '@/stores/timers';

const props = defineProps<{
  showModal: boolean;
}>();

const emit = defineEmits<{
  close: [];
  select: [timer: Timer];
}>();

const timersStore = useTimersStore();
const timersList = timersStore.timersList;

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
</script>

<style scoped></style>

