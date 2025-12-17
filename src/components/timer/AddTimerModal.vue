<template>
  <ModalDialog :show-modal="showModal" @close="handleClose">
    <template #content>
      <div class="flex flex-col h-full max-h-[80vh]">
        <!-- Прокручиваемый контент -->
        <div class="flex-1 overflow-y-auto py-4">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
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
                class="text-blue-600"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h2 class="text-xl font-bold">{{ editingTimer ? 'Редактировать таймер' : 'Создать таймер' }}</h2>
          </div>

          <div class="space-y-4">
          <!-- Название -->
          <div>
            <label class="block text-sm font-semibold mb-2 text-gray-700">
              Название таймера
            </label>
            <n-input
              v-model:value="form.name"
              placeholder="Например: Тренировка, Работа, Отдых"
              size="large"
              :status="form.name.trim() === '' && showErrors ? 'error' : undefined"
              clearable
            />
            <p v-if="form.name.trim() === '' && showErrors" class="text-xs text-red-500 mt-1">
              Введите название таймера
            </p>
          </div>

          <!-- Предпросмотр времени -->
          <div
            v-if="totalSeconds > 0"
            class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-600">Итоговое время:</span>
              <span class="text-2xl font-bold text-blue-600">{{ formattedTime }}</span>
            </div>
          </div>

          <!-- Шаблоны времени -->
          <div>
            <label class="block text-sm font-semibold mb-2 text-gray-700">
              Быстрые шаблоны
            </label>
            <div class="grid grid-cols-3 gap-2">
              <n-button
                v-for="template in timeTemplates"
                :key="template.name"
                :type="selectedTemplate === template.name ? 'primary' : 'default'"
                :tertiary="selectedTemplate !== template.name"
                size="medium"
                class="h-11"
                @click="applyTemplate(template)"
              >
                <div class="flex flex-col items-center">
                  <span class="font-semibold text-sm">{{ template.name }}</span>
                  <span class="text-xs opacity-70">{{ formatTemplateTime(template) }}</span>
                </div>
              </n-button>
            </div>
          </div>

          <!-- Длительность -->
          <div>
            <label class="block text-sm font-semibold mb-2 text-gray-700">
              Или установите вручную
            </label>
            <div class="grid grid-cols-3 gap-3">
              <div class="text-center">
                <label class="block text-xs font-medium text-gray-500 mb-2">Часы</label>
                <div class="relative">
                  <n-input-number
                    v-model:value="form.duration.hours"
                    :min="0"
                    :max="23"
                    :show-button="false"
                    size="large"
                    placeholder="0"
                    class="w-full text-center text-lg font-semibold"
                    @update:value="selectedTemplate = null"
                  />
                </div>
              </div>
              <div class="text-center">
                <label class="block text-xs font-medium text-gray-500 mb-2">Минуты</label>
                <div class="relative">
                  <n-input-number
                    v-model:value="form.duration.minutes"
                    :min="0"
                    :max="59"
                    :show-button="false"
                    size="large"
                    placeholder="0"
                    class="w-full text-center text-lg font-semibold"
                    @update:value="selectedTemplate = null"
                  />
                </div>
              </div>
              <div class="text-center">
                <label class="block text-xs font-medium text-gray-500 mb-2">Секунды</label>
                <div class="relative">
                  <n-input-number
                    v-model:value="form.duration.seconds"
                    :min="0"
                    :max="59"
                    :show-button="false"
                    size="large"
                    placeholder="0"
                    class="w-full text-center text-lg font-semibold"
                    @update:value="selectedTemplate = null"
                  />
                </div>
              </div>
            </div>
            <p v-if="totalSeconds === 0 && showErrors" class="text-xs text-red-500 mt-2 text-center">
              Установите длительность таймера
            </p>
          </div>
          </div>
        </div>

        <!-- Закрепленные кнопки внизу -->
        <div class="flex flex-col gap-3 pt-4 pb-2 border-t border-gray-200 bg-white sticky bottom-0 -mx-4 px-4 mt-4">
          <n-button
            type="primary"
            block
            size="large"
            :loading="isSaving"
            :disabled="!isFormValid"
            @click="handleSave"
          >
            <template #icon>
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
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
            </template>
            Сохранить
          </n-button>
          <n-button
            block
            size="large"
            :disabled="isSaving"
            @click="handleClose"
          >
            Отмена
          </n-button>
        </div>
      </div>
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { NInput, NInputNumber, NButton } from 'naive-ui';
import ModalDialog from '@/components/ui/ModalDialog.vue';
import type { Timer } from '@/stores/timers';

const props = defineProps<{
  showModal: boolean;
  editingTimer?: Timer | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [timer: { name: string; duration: { hours: number; minutes: number; seconds: number } }];
  update: [id: string, timer: { name: string; duration: { hours: number; minutes: number; seconds: number } }];
}>();

const form = ref({
  name: '',
  duration: {
    hours: 0,
    minutes: 0,
    seconds: 0,
  },
});

const selectedTemplate = ref<string | null>(null);
const showErrors = ref(false);
const isSaving = ref(false);

// Загружаем данные таймера при редактировании
watch(() => props.editingTimer, (timer) => {
  if (timer) {
    form.value = {
      name: timer.name,
      duration: {
        hours: timer.duration.hours,
        minutes: timer.duration.minutes,
        seconds: timer.duration.seconds,
      },
    };
    selectedTemplate.value = null;
  } else {
    // Сброс формы при создании нового таймера
    form.value = {
      name: '',
      duration: {
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
    };
    selectedTemplate.value = null;
  }
  showErrors.value = false;
}, { immediate: true });

const timeTemplates = [
  { name: '5 мин', hours: 0, minutes: 5, seconds: 0 },
  { name: '10 мин', hours: 0, minutes: 10, seconds: 0 },
  { name: '15 мин', hours: 0, minutes: 15, seconds: 0 },
  { name: '30 мин', hours: 0, minutes: 30, seconds: 0 },
  { name: '1 час', hours: 1, minutes: 0, seconds: 0 },
  { name: '2 часа', hours: 2, minutes: 0, seconds: 0 },
];

const totalSeconds = computed(() => {
  return form.value.duration.hours * 3600 +
    form.value.duration.minutes * 60 +
    form.value.duration.seconds;
});

const formattedTime = computed(() => {
  const hours = form.value.duration.hours;
  const minutes = form.value.duration.minutes;
  const seconds = form.value.duration.seconds;
  
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}ч`);
  if (minutes > 0) parts.push(`${minutes}м`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}с`);
  
  return parts.join(' ');
});

const formatTemplateTime = (template: typeof timeTemplates[0]) => {
  const parts: string[] = [];
  if (template.hours > 0) parts.push(`${template.hours}ч`);
  if (template.minutes > 0) parts.push(`${template.minutes}м`);
  if (template.seconds > 0) parts.push(`${template.seconds}с`);
  return parts.join(' ') || '0с';
};

const applyTemplate = (template: typeof timeTemplates[0]) => {
  form.value.duration = {
    hours: template.hours,
    minutes: template.minutes,
    seconds: template.seconds,
  };
  selectedTemplate.value = template.name;
  showErrors.value = false;
};

const isFormValid = computed(() => {
  return (
    form.value.name.trim() !== '' &&
    totalSeconds.value > 0
  );
});

const handleClose = () => {
  showErrors.value = false;
  emit('close');
};

const handleSave = async () => {
  if (!isFormValid.value) {
    showErrors.value = true;
    return;
  }

  isSaving.value = true;
  
  // Небольшая задержка для лучшего UX
  await new Promise(resolve => setTimeout(resolve, 300));

  const timerData = {
    name: form.value.name,
    duration: { ...form.value.duration },
  };

  if (props.editingTimer) {
    emit('update', props.editingTimer.id, timerData);
  } else {
    emit('save', timerData);
  }

  // Сброс формы
  form.value = {
    name: '',
    duration: {
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
  };
  selectedTemplate.value = null;
  showErrors.value = false;
  isSaving.value = false;
  emit('close');
};

// Сброс ошибок при изменении формы
watch(() => form.value, () => {
  if (showErrors.value && isFormValid.value) {
    showErrors.value = false;
  }
}, { deep: true });
</script>

<style scoped>
:deep(.n-input-number) {
  text-align: center;
}

:deep(.n-input-number-input) {
  text-align: center;
  font-weight: 600;
}

:deep(.n-button) {
  transition: all 0.2s ease;
}

:deep(.n-button--primary-type) {
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

:deep(.n-button--primary-type:hover) {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}
</style>

