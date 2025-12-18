<template>
  <n-drawer
    :show="showModal"
    :width="drawerWidth"
    placement="right"
    :mask-closable="true"
    @update:show="handleDrawerClose"
  >
    <n-drawer-content :title="editingTimer ? 'Редактировать таймер' : 'Создать таймер'" closable>
      <div class="flex flex-col h-full">
        <!-- Прокручиваемый контент -->
        <div class="flex-1 overflow-y-auto py-4">
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

          <!-- Цвета анимации -->
          <div>
            <label class="block text-sm font-semibold mb-2 text-gray-700">
              Цвета анимации таймера
            </label>
            
            <!-- Готовые варианты -->
            <div class="mb-4">
              <p class="text-xs text-gray-500 mb-2">Готовые варианты:</p>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="(preset, index) in colorPresets"
                  :key="index"
                  type="button"
                  class="relative h-16 rounded-lg border-2 transition-all duration-200 hover:scale-105 active:scale-95"
                  :class="
                    isPresetSelected(preset)
                      ? 'border-blue-500 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  "
                  @click="selectColorPreset(preset)"
                >
                  <!-- Превью цветов -->
                  <div class="absolute inset-0 rounded-lg overflow-hidden">
                    <div
                      class="h-1/2 w-full"
                      :style="{ backgroundColor: preset.lightColor }"
                    ></div>
                    <div
                      class="h-1/2 w-full"
                      :style="{ backgroundColor: preset.fillColor }"
                    ></div>
                  </div>
                  <!-- Индикатор выбора -->
                  <div
                    v-if="isPresetSelected(preset)"
                    class="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            <!-- Кастомные цвета -->
            <div class="space-y-3">
              <p class="text-xs text-gray-500 mb-2">Или настройте самостоятельно:</p>
              
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-2">
                    Верхний цвет
                  </label>
                  <div class="flex gap-2">
                    <input
                      type="color"
                      v-model="form.colors.lightColor"
                      class="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                      @input="customColorSelected = true"
                    />
                    <n-input
                      v-model:value="form.colors.lightColor"
                      placeholder="#EAE0CF"
                      size="medium"
                      @update:value="customColorSelected = true"
                    />
                  </div>
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-2">
                    Нижний цвет
                  </label>
                  <div class="flex gap-2">
                    <input
                      type="color"
                      v-model="form.colors.fillColor"
                      class="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                      @input="customColorSelected = true"
                    />
                    <n-input
                      v-model:value="form.colors.fillColor"
                      placeholder="#213448"
                      size="medium"
                      @update:value="customColorSelected = true"
                    />
                  </div>
                </div>
              </div>

              <!-- Превью кастомных цветов -->
              <div class="mt-3">
                <p class="text-xs text-gray-500 mb-2">Превью:</p>
                <div class="h-20 rounded-lg border border-gray-200 overflow-hidden">
                  <div
                    class="h-1/2 w-full"
                    :style="{ backgroundColor: form.colors.lightColor }"
                  ></div>
                  <div
                    class="h-1/2 w-full"
                    :style="{ backgroundColor: form.colors.fillColor }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Выбор иконки -->
          <div>
            <label class="block text-sm font-semibold mb-2 text-gray-700">
              Иконка таймера
            </label>
            <div class="grid grid-cols-4 gap-3">
              <button
                v-for="icon in activeIcons"
                :key="icon.id"
                type="button"
                class="relative h-16 rounded-lg border-2 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden"
                :class="
                  form.iconId === icon.id
                    ? 'border-blue-500 shadow-md bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                "
                @click="selectIcon(icon.id)"
              >
                <!-- SVG превью иконки или иконка "без иконки" -->
                <div
                  v-if="icon.id === 'none'"
                  class="w-10 h-10 flex items-center justify-center text-gray-400"
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
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                  </svg>
                </div>
                <div
                  v-else
                  class="w-10 h-10 flex items-center justify-center"
                  v-html="getIconPreview(icon)"
                ></div>
                <!-- Индикатор выбора -->
                <div
                  v-if="form.iconId === icon.id"
                  class="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center z-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-2">
              Выберите иконку, которая будет отображаться во время работы таймера
            </p>
          </div>
          </div>
        </div>

        <!-- Закрепленные кнопки внизу -->
        <div class="flex flex-col gap-3 pt-4 pb-2 border-t border-gray-200 mt-4">
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
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { NInput, NInputNumber, NButton, NDrawer, NDrawerContent } from 'naive-ui';
import type { Timer, TimerColors } from '@/stores/timers';
import { COLOR_PRESETS, DEFAULT_COLORS } from '@/stores/timers';
import { getActiveIcons, getDefaultIcon } from '@/config/timerIcons';

const props = defineProps<{
  showModal: boolean;
  editingTimer?: Timer | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [timer: { name: string; duration: { hours: number; minutes: number; seconds: number }; colors: { lightColor: string; fillColor: string }; iconId?: string }];
  update: [id: string, timer: { name: string; duration: { hours: number; minutes: number; seconds: number }; colors: { lightColor: string; fillColor: string }; iconId?: string }];
}>();

const windowWidth = ref(window.innerWidth);

const drawerWidth = computed(() => {
  return windowWidth.value * 0.85;
});

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const activeIcons = getActiveIcons();
// Получаем иконку по умолчанию, исключая "none"
const defaultIcon = computed(() => {
  const icons = getActiveIcons().filter(icon => icon.id !== 'none');
  return icons.length > 0 ? icons[0] : undefined;
});

const form = ref({
  name: '',
  duration: {
    hours: 0,
    minutes: 0,
    seconds: 0,
  },
  colors: {
    lightColor: DEFAULT_COLORS.lightColor,
    fillColor: DEFAULT_COLORS.fillColor,
  } as TimerColors,
  iconId: defaultIcon.value?.id,
});

const selectedTemplate = ref<string | null>(null);
const showErrors = ref(false);
const isSaving = ref(false);
const customColorSelected = ref(false);
const colorPresets = COLOR_PRESETS;

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
      colors: timer.colors || DEFAULT_COLORS,
      iconId: timer.iconId || defaultIcon.value?.id,
    };
    selectedTemplate.value = null;
    customColorSelected.value = false;
  } else {
    // Сброс формы при создании нового таймера
    form.value = {
      name: '',
      duration: {
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
      colors: { ...DEFAULT_COLORS },
      iconId: defaultIcon.value?.id,
    };
    selectedTemplate.value = null;
    customColorSelected.value = false;
  }
  showErrors.value = false;
}, { immediate: true });

// Автофокус на input при открытии drawer
watch(() => props.showModal, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    // Небольшая задержка для корректной работы фокуса после анимации drawer
    setTimeout(() => {
      // Используем querySelector для поиска input в drawer
      const drawerContent = document.querySelector('.n-drawer-content');
      if (drawerContent) {
        const inputElement = drawerContent.querySelector('input[type="text"]') as HTMLInputElement;
        if (inputElement) {
          inputElement.focus();
          inputElement.select();
        }
      }
    }, 250);
  }
});

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

const handleDrawerClose = (show: boolean) => {
  if (!show) {
    handleClose();
  }
};

const isPresetSelected = (preset: TimerColors): boolean => {
  if (customColorSelected.value) return false;
  return (
    preset.lightColor === form.value.colors.lightColor &&
    preset.fillColor === form.value.colors.fillColor
  );
};

const selectColorPreset = (preset: TimerColors) => {
  form.value.colors = { ...preset };
  customColorSelected.value = false;
};

const selectIcon = (iconId: string) => {
  form.value.iconId = iconId;
};

// Получаем превью иконки для отображения в селекторе
const getIconPreview = (icon: { path: string; id: string }) => {
  // Пропускаем опцию "без иконки"
  if (icon.id === 'none' || !icon.path) {
    return '';
  }
  
  // Если path содержит SVG содержимое, извлекаем его и масштабируем
  if (icon.path.startsWith('<svg') || icon.path.includes('<?xml')) {
    // Парсим SVG и создаем превью
    const svgMatch = icon.path.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
    if (svgMatch) {
      const svgAttributes = icon.path.match(/<svg([^>]*)>/i)?.[1] || '';
      const viewBoxMatch = svgAttributes.match(/viewBox="([^"]*)"/i);
      const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 470 470';
      
      return `
        <svg width="40" height="40" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" style="fill: currentColor; color: #4B5563;">
          ${svgMatch[1]}
        </svg>
      `;
    }
  }
  return '';
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
    colors: { ...form.value.colors },
    iconId: form.value.iconId,
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
    colors: { ...DEFAULT_COLORS },
    iconId: defaultIcon.value?.id,
  };
  selectedTemplate.value = null;
  customColorSelected.value = false;
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

