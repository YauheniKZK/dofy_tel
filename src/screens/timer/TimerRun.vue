<template>
  <div
    class="relative p-4 pb-24 min-h-full flex flex-col items-center justify-center"
  >
    <!-- Canvas анимация фона -->
    <canvas
      ref="canvasRef"
      class="fixed inset-0 w-full h-full pointer-events-none"
      style="z-index: 0"
    ></canvas>

    <div v-if="timer" class="w-full max-w-md relative z-10">
      <!-- Заголовок с кнопкой выбора таймера -->
      <Transition name="fade">
        <div v-if="areElementsVisible" class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <h1 class="text-xl font-bold text-gray-800 flex-1 truncate pr-2">
              {{ timer.name }}
            </h1>
          </div>
          <n-button
            type="primary"
            size="medium"
            block
            @click="showSelectModal = true"
            class="h-12 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style="
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border: none;
            "
          >
            <template #icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path
                  d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"
                ></path>
              </svg>
            </template>
            Выбрать другой таймер
          </n-button>
        </div>
      </Transition>

      <!-- Большой счетчик времени -->
      <div class="mb-8 flex flex-col items-center justify-center">
        <div
          class="timer-display relative flex items-center justify-center"
          style="min-height: 150px"
        >
          <!-- Скрытые элементы для измерения размеров текста -->
          <div class="absolute opacity-0 pointer-events-none whitespace-nowrap">
            <template
              v-for="(char, index) in timeChars"
              :key="`measure-${formattedTime}-${index}`"
            >
              <span
                v-if="char === ':'"
                :ref="(el) => setTimeCharRef(el, index)"
                class="text-7xl sm:text-8xl md:text-9xl font-bold mx-1 inline-block"
              >
                {{ char }}
              </span>
              <span
                v-else
                :ref="(el) => setTimeCharRef(el, index)"
                class="text-7xl sm:text-8xl md:text-9xl font-bold tracking-tighter inline-block"
              >
                {{ char }}
              </span>
            </template>
          </div>
          <!-- Canvas для отрисовки цифр с эффектом разделения -->
          <canvas
            ref="timeCanvasRef"
            class="relative"
            style="display: block"
          ></canvas>
        </div>
        <Transition name="fade">
          <div
            v-if="areElementsVisible"
            class="text-sm sm:text-base text-gray-500 font-medium mt-4"
          >
            {{ progressText }}
          </div>
        </Transition>
      </div>

      <!-- Иконка таймера (показывается только когда таймер работает и иконка не отключена) -->
      <!-- Вынесена за пределы контейнера с z-10, чтобы быть поверх canvas -->
      <Transition name="fade">
        <div
          v-if="isRunning && timer && selectedIcon && timer.iconId !== 'none'"
          ref="timerIconRef"
          class="fixed left-1/2 transform -translate-x-1/2 flex justify-center pointer-events-none"
          style="z-index: 20"
          :style="{
            top: timerIconTop + 'px',
          }"
          @transitionend="updateTimerIconGradient"
        >
          <TimerIcon
            :icon-id="timer.iconId || 'coffee'"
            :gradient-stop="timerIconGradientStop"
            :colors="timerIconGradientColors"
            view-box="0 0 470 470"
          />
        </div>
      </Transition>

      <!-- Кнопки управления -->
      <Transition name="fade">
        <div
          v-if="areElementsVisible"
          class="flex justify-center items-center gap-6 mt-8"
        >
          <!-- Кнопка запуска (когда таймер не запущен) -->
          <n-button
            v-if="!isRunning && !isPaused"
            type="primary"
            circle
            size="large"
            class="w-20 h-20 shadow-xl hover:scale-110 active:scale-95 transition-all duration-200"
            @click="startTimer()"
          >
            <template #icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </template>
          </n-button>

          <!-- Кнопки управления (когда таймер запущен или на паузе) -->
          <template v-if="isRunning || isPaused">
            <!-- Кнопка паузы/продолжения -->
            <n-button
              v-if="isRunning"
              type="warning"
              circle
              size="large"
              class="w-16 h-16 shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
              @click="pauseTimer()"
            >
              <template #icon>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              </template>
            </n-button>

            <n-button
              v-if="isPaused"
              type="primary"
              circle
              size="large"
              class="w-16 h-16 shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
              @click="resumeTimer()"
            >
              <template #icon>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </template>
            </n-button>

            <!-- Кнопка остановки -->
            <n-button
              type="error"
              circle
              size="large"
              class="w-16 h-16 shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
              @click="stopTimer()"
            >
              <template #icon>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="6" y="6" width="12" height="12"></rect>
                </svg>
              </template>
            </n-button>
          </template>
        </div>
      </Transition>
    </div>

    <!-- Сообщение об ошибке -->
    <div v-else class="text-center text-gray-500">
      <p class="mb-4 text-lg">Таймер не найден</p>
      <n-button @click="goBack">Вернуться назад</n-button>
    </div>

    <!-- Модальное окно выбора таймера -->
    <SelectTimerModal
      :show-modal="showSelectModal"
      @close="showSelectModal = false"
      @select="handleSelectTimer"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
  type ComponentPublicInstance,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { NButton, useNotification } from "naive-ui";
import { useTimersStore, DEFAULT_COLORS } from "@/stores/timers";
import SelectTimerModal from "@/components/timer/SelectTimerModal.vue";
import TimerIcon from "@/components/timer/TimerIcon.vue";
import type { Timer } from "@/stores/timers";
import { useTabBarVisibility } from "@/composables/useTabBarVisibility";
import { getIconById, getDefaultIcon } from "@/config/timerIcons";

const notification = useNotification();

const route = useRoute();
const router = useRouter();
const timersStore = useTimersStore();
const { isTabBarVisible, setShouldHideTabBar } = useTabBarVisibility();

const timer = ref<Timer | null>(null);
const remainingSeconds = ref(0);
const isRunning = ref(false);
const isPaused = ref(false);
const showSelectModal = ref(false);

// Определяем, должны ли элементы интерфейса быть видимыми и интерактивными
const areElementsVisible = computed(
  () => isTabBarVisible.value || !isRunning.value
);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const timeCanvasRef = ref<HTMLCanvasElement | null>(null);
const timerIconRef = ref<HTMLElement | null>(null);
const timeCharRefs = ref<(HTMLElement | null)[]>([]);

// Выбранная иконка для таймера
const selectedIcon = computed(() => {
  if (!timer.value) return null;
  const iconId = timer.value.iconId || "coffee";
  return getIconById(iconId) || getDefaultIcon();
});
let intervalId: number | null = null;
let animationFrameId: number | null = null;
let animatedFillHeight = 0; // Текущая анимированная высота заполнения
let lastUpdateTime = 0;

// Состояние для анимации цифр
interface CharAnimation {
  oldChar: string;
  newChar: string;
  progress: number; // 0-1
  startTime: number;
}

const charAnimations = ref<Map<number, CharAnimation>>(new Map());
const previousChars = ref<string[]>([]);
const ANIMATION_DURATION = 300; // миллисекунды

// Кеш для вычислений размера шрифта и позиций
let cachedFontSize: number | null = null;
let cachedCharPositions:
  | {
      x: number;
      y: number;
      width: number;
      char: string;
      fixedWidth: number;
    }[]
  | null = null;
let cachedTotalWidth: number | null = null;
let cachedCanvasHeight: number | null = null;
let cachedTimeString: string = "";

// Easing функции для плавной анимации
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

const totalSeconds = computed(() => {
  if (!timer.value) return 0;
  return timersStore.getTotalSeconds(timer.value);
});

const formattedTime = computed(() => {
  const total = remainingSeconds.value;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
});

const timeChars = computed(() => {
  return formattedTime.value.split("");
});

const setTimeCharRef = (
  el: Element | ComponentPublicInstance | null,
  index: number
) => {
  if (el && el instanceof HTMLElement) {
    timeCharRefs.value[index] = el;
  }
};

// Анимация каждой цифры при изменении времени
const previousTime = ref("");
watch(
  () => formattedTime.value,
  (newTime) => {
    const oldTime = previousTime.value;

    if (!oldTime) {
      // Инициализируем предыдущие цифры
      previousChars.value = newTime.split("");
      previousTime.value = newTime;
      return;
    }

    const oldChars = oldTime.split("");
    const newChars = newTime.split("");

    // Проверяем, какие цифры изменились и запускаем анимацию
    newChars.forEach((newChar, index) => {
      const oldChar = oldChars[index];
      // Анимируем только если цифра изменилась и это не двоеточие
      if (
        oldChar !== undefined &&
        oldChar !== newChar &&
        newChar !== ":" &&
        oldChar !== ":"
      ) {
        // Запускаем анимацию для этой позиции с использованием performance.now()
        charAnimations.value.set(index, {
          oldChar: oldChar,
          newChar: newChar,
          progress: 0,
          startTime: performance.now(),
        });
      }
    });

    // Обновляем предыдущие значения
    previousChars.value = [...newChars];
    previousTime.value = newTime;

    // Запускаем анимацию, если есть изменения и анимация еще не запущена
    if (charAnimations.value.size > 0) {
      // Останавливаем обычную анимацию canvas, если она запущена
      if (animationFrameId !== null && isRunning.value) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      // Запускаем анимацию цифр
      animateChars();
    }
  }
);

// Функция для анимации цифр с улучшенной плавностью
const animateChars = () => {
  const now = performance.now();
  let hasActiveAnimations = false;

  // Обновляем прогресс всех анимаций с easing функцией
  charAnimations.value.forEach((anim, index) => {
    const elapsed = now - anim.startTime;
    const rawProgress = Math.min(elapsed / ANIMATION_DURATION, 1);

    // Применяем easing функцию для более плавной анимации
    anim.progress = easeOutCubic(rawProgress);

    if (rawProgress < 1) {
      hasActiveAnimations = true;
    } else {
      // Анимация завершена, удаляем её
      charAnimations.value.delete(index);
    }
  });

  // Обновляем canvas и перерисовываем цифры
  drawCanvas();
  drawTimeChars();

  // Обновляем градиент иконки таймера
  updateTimerIconGradient();

  // Продолжаем анимацию, если есть активные анимации
  if (hasActiveAnimations) {
    animationFrameId = requestAnimationFrame(animateChars);
  } else {
    // Если нет активных анимаций, но таймер запущен, продолжаем обычную анимацию canvas
    animationFrameId = null;
    if (isRunning.value) {
      animateCanvas();
    }
  }
};

// Анимация пульсации больше не нужна, так как цифры отрисовываются на canvas

const progressPercentage = computed(() => {
  if (!timer.value || totalSeconds.value === 0) return 0;
  const elapsed = totalSeconds.value - remainingSeconds.value;
  return Math.round((elapsed / totalSeconds.value) * 100);
});

const progressText = computed(() => {
  return `Прогресс: ${progressPercentage.value}%`;
});

// Градиент для иконки таймера
const timerIconGradientColors = computed(() => {
  const timerColors = timer.value?.colors || DEFAULT_COLORS;
  return {
    lightColor: timerColors.lightColor,
    fillColor: timerColors.fillColor,
  };
});

// Реактивное значение для позиции линии относительно иконки таймера
const timerIconLinePosition = ref(0);
const timerIconTop = ref(0);

const timerIconGradientStop = computed(() => {
  return timerIconLinePosition.value;
});

// Функция для обновления позиции линии относительно иконки таймера
// Использует ту же логику, что и для цифр
const updateTimerIconGradient = () => {
  if (!canvasRef.value || !timeCanvasRef.value) {
    timerIconLinePosition.value = 0;
    return;
  }

  // Получаем позицию canvas с цифрами для размещения иконки под ним
  const timeCanvasRect = timeCanvasRef.value.getBoundingClientRect();
  timerIconTop.value = timeCanvasRect.bottom + 24; // 24px отступ от таймера

  // Если иконка еще не отрисована, просто устанавливаем позицию
  if (!timerIconRef.value) {
    timerIconLinePosition.value = 0;
    return;
  }

  const iconRect = timerIconRef.value.getBoundingClientRect();
  const canvasRect = canvasRef.value.getBoundingClientRect();

  // Вычисляем позицию линии относительно иконки (та же логика, что для цифр)
  const lineYViewport = canvasRect.top + animatedFillHeight;
  const iconTop = iconRect.top;
  const iconBottom = iconRect.bottom;
  const lineYRelative = lineYViewport - iconTop;

  // Вычисляем высоту иконки
  const iconHeight = iconBottom - iconTop;
  if (iconHeight === 0) {
    timerIconLinePosition.value = 0;
    return;
  }

  // Определяем позицию границы градиента (та же логика, что для цифр)
  let boundaryPercent: number;
  if (isNaN(lineYRelative) || !isFinite(lineYRelative) || lineYRelative < 0) {
    // Линия выше иконки - весь светлый цвет
    boundaryPercent = 0;
  } else if (lineYRelative > iconHeight) {
    // Линия ниже иконки - весь темный цвет
    boundaryPercent = 1;
  } else {
    // Линия проходит через иконку - вычисляем процент
    boundaryPercent = Math.max(0, Math.min(1, lineYRelative / iconHeight));
  }

  timerIconLinePosition.value = boundaryPercent;
};

// Удаляем progressColor, так как он больше не используется

// Canvas анимация
const drawCanvas = () => {
  if (!canvasRef.value || !timer.value) return;

  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Получаем devicePixelRatio для четкой отрисовки на Retina дисплеях
  const dpr = window.devicePixelRatio || 1;
  const displayWidth = window.innerWidth;
  const displayHeight = window.innerHeight;

  // Устанавливаем внутренние размеры canvas с учетом devicePixelRatio
  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;

  // Устанавливаем CSS размеры (отображаемые размеры)
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;

  // Масштабируем контекст для четкой отрисовки
  ctx.scale(dpr, dpr);

  // Очищаем canvas (прозрачный фон)
  ctx.clearRect(0, 0, displayWidth, displayHeight);

  // Вычисляем целевую высоту линии
  // Линия движется сверху вниз по мере работы таймера
  const elapsedSeconds = totalSeconds.value - remainingSeconds.value;
  const targetFillPercentage =
    totalSeconds.value > 0 ? elapsedSeconds / totalSeconds.value : 0;
  const targetFillHeight = displayHeight * targetFillPercentage;

  // Плавная интерполяция к целевой высоте с использованием performance.now()
  const currentTime = performance.now();
  if (lastUpdateTime === 0) {
    lastUpdateTime = currentTime;
    animatedFillHeight = targetFillHeight;
  }

  // Ограничиваем deltaTime для стабильности (максимум 50ms)
  const deltaTime = Math.min(currentTime - lastUpdateTime, 50);
  lastUpdateTime = currentTime;

  // Улучшенный lerping с easing функцией для более плавного движения
  const distance = targetFillHeight - animatedFillHeight;
  const absDistance = Math.abs(distance);

  // Используем адаптивный lerp factor в зависимости от расстояния
  if (absDistance > 0.1) {
    // Для больших расстояний используем более быстрое движение
    const lerpFactor = Math.min(deltaTime / 150, 0.3);
    animatedFillHeight += distance * lerpFactor;
  } else {
    // Для малых расстояний плавно доводим до цели
    animatedFillHeight = targetFillHeight;
  }

  // Ограничиваем значения
  animatedFillHeight = Math.max(0, Math.min(displayHeight, animatedFillHeight));

  // Цвета заливки из настроек таймера
  const timerColors = timer.value?.colors || DEFAULT_COLORS;
  const fillColor = timerColors.fillColor; // Темный цвет под линией
  const lightColor = timerColors.lightColor; // Светлый цвет над линией

  // Рисуем заливку светлым цветом над линией
  if (animatedFillHeight > 0) {
    ctx.fillStyle = lightColor;
    ctx.fillRect(0, 0, displayWidth, animatedFillHeight);
  }

  // Рисуем заливку темным цветом под линией
  if (animatedFillHeight < displayHeight) {
    const fillAreaHeight = displayHeight - animatedFillHeight;
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, animatedFillHeight, displayWidth, fillAreaHeight);
  } else {
    // Если линия достигла низа, заливаем весь экран темным цветом
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, displayWidth, displayHeight);
  }

  // Рисуем горизонтальную линию
  if (animatedFillHeight > 0 && animatedFillHeight < displayHeight) {
    ctx.strokeStyle = fillColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, animatedFillHeight);
    ctx.lineTo(displayWidth, animatedFillHeight);
    ctx.stroke();
  }
};

const animateCanvas = () => {
  // Если идет анимация цифр, не запускаем обычную анимацию canvas
  if (charAnimations.value.size > 0) {
    return;
  }

  // Рисуем canvas и цифры
  drawCanvas();
  drawTimeChars();

  if (isRunning.value) {
    animationFrameId = requestAnimationFrame(animateCanvas);
  } else {
    animationFrameId = null;
  }
};

// Удаляем timeColor, так как цвет цифр теперь управляется анимацией

// Функция для отрисовки цифр на canvas с плавным изменением цвета и кешированием
const drawTimeChars = () => {
  if (!timeCanvasRef.value || !canvasRef.value) {
    return;
  }

  if (!timeChars.value || timeChars.value.length === 0) {
    return;
  }

  const timeCanvas = timeCanvasRef.value;
  const ctx = timeCanvas.getContext("2d", { alpha: true });
  if (!ctx) {
    return;
  }

  // Получаем devicePixelRatio для четкой отрисовки на Retina дисплеях
  const dpr = window.devicePixelRatio || 1;

  const currentTimeString = formattedTime.value;

  // Используем кеш, если время не изменилось и нет активных анимаций
  if (
    cachedTimeString === currentTimeString &&
    cachedCharPositions !== null &&
    cachedFontSize !== null &&
    cachedTotalWidth !== null &&
    cachedCanvasHeight !== null &&
    charAnimations.value.size === 0
  ) {
    // Используем кешированные значения
    const fontSize = cachedFontSize;
    const charPositions = cachedCharPositions;
    const totalWidth = cachedTotalWidth;
    const canvasHeight = cachedCanvasHeight;

    // Устанавливаем внутренние размеры canvas с учетом devicePixelRatio
    timeCanvas.width = totalWidth * dpr;
    timeCanvas.height = canvasHeight * dpr;
    // Устанавливаем CSS размеры (отображаемые размеры)
    timeCanvas.style.width = `${totalWidth}px`;
    timeCanvas.style.height = `${canvasHeight}px`;

    // Масштабируем контекст для четкой отрисовки
    ctx.scale(dpr, dpr);

    ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    // Получаем позицию canvas с цифрами
    const timeCanvasRect = timeCanvas.getBoundingClientRect();
    const canvasRect = canvasRef.value.getBoundingClientRect();
    const lineYViewport = canvasRect.top + animatedFillHeight;
    const lineYRelative = lineYViewport - timeCanvasRect.top;

    // Очищаем canvas
    ctx.clearRect(0, 0, totalWidth, canvasHeight);

    // Рисуем цифры с кешированными позициями
    drawCharsWithGradient(
      ctx,
      charPositions,
      fontSize,
      canvasHeight,
      lineYRelative
    );
    return;
  }

  // Пересчитываем размеры и позиции
  const targetWidth = window.innerWidth * 0.7;
  let fontSize = Math.floor(window.innerWidth * 0.1);
  let totalWidth = 0;
  let charPositions: {
    x: number;
    y: number;
    width: number;
    char: string;
    fixedWidth: number;
  }[] = [];
  let iterations = 0;
  const maxIterations = 20;
  let minFontSize = 20;
  let maxFontSize = Math.floor(window.innerWidth * 0.3);

  // Временно устанавливаем размеры canvas для измерения текста
  // Используем реальные размеры без масштабирования для измерения
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) return;

  while (
    iterations < maxIterations &&
    Math.abs(totalWidth - targetWidth) > targetWidth * 0.05
  ) {
    fontSize = Math.floor((minFontSize + maxFontSize) / 2);
    tempCtx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
    tempCtx.textBaseline = "top";
    tempCtx.textAlign = "left";

    let maxDigitWidth = 0;
    for (let i = 0; i <= 9; i++) {
      const metrics = tempCtx.measureText(String(i));
      maxDigitWidth = Math.max(maxDigitWidth, metrics.width);
    }

    const colonWidth = tempCtx.measureText(":").width;
    const colonSpacing = fontSize * 0.3; // Отступ вокруг двоеточия для центрирования

    totalWidth = 0;
    charPositions = [];

    timeChars.value.forEach((char) => {
      const metrics = tempCtx.measureText(char);
      const actualWidth = metrics.width;

      if (char === ":") {
        // Для двоеточия добавляем отступы до и после для центрирования
        const spacingBefore = colonSpacing / 2;
        const spacingAfter = colonSpacing / 2;

        // Добавляем отступ перед двоеточием
        totalWidth += spacingBefore;

        charPositions.push({
          x: totalWidth,
          y: 0,
          width: actualWidth,
          char,
          fixedWidth: colonWidth + spacingBefore + spacingAfter,
        });

        totalWidth += colonWidth + spacingAfter;
      } else {
        // Для цифр используем фиксированную ширину
        charPositions.push({
          x: totalWidth,
          y: 0,
          width: actualWidth,
          char,
          fixedWidth: maxDigitWidth,
        });
        totalWidth += maxDigitWidth;
      }
    });

    if (totalWidth < targetWidth) {
      minFontSize = fontSize;
    } else {
      maxFontSize = fontSize;
    }

    iterations++;
  }

  if (iterations >= maxIterations) {
    fontSize = Math.floor((minFontSize + maxFontSize) / 2);
    tempCtx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
    tempCtx.textBaseline = "top";
    tempCtx.textAlign = "left";

    let maxDigitWidth = 0;
    for (let i = 0; i <= 9; i++) {
      const metrics = tempCtx.measureText(String(i));
      maxDigitWidth = Math.max(maxDigitWidth, metrics.width);
    }

    const colonWidth = tempCtx.measureText(":").width;
    const colonSpacing = fontSize * 0.3; // Отступ вокруг двоеточия для центрирования

    totalWidth = 0;
    charPositions = [];

    timeChars.value.forEach((char) => {
      const metrics = tempCtx.measureText(char);
      const actualWidth = metrics.width;

      if (char === ":") {
        // Для двоеточия добавляем отступы до и после для центрирования
        const spacingBefore = colonSpacing / 2;
        const spacingAfter = colonSpacing / 2;

        // Добавляем отступ перед двоеточием
        totalWidth += spacingBefore;

        charPositions.push({
          x: totalWidth,
          y: 0,
          width: actualWidth,
          char,
          fixedWidth: colonWidth + spacingBefore + spacingAfter,
        });

        totalWidth += colonWidth + spacingAfter;
      } else {
        // Для цифр используем фиксированную ширину
        charPositions.push({
          x: totalWidth,
          y: 0,
          width: actualWidth,
          char,
          fixedWidth: maxDigitWidth,
        });
        totalWidth += maxDigitWidth;
      }
    });
  }

  if (totalWidth === 0) return;

  // Обновляем кеш
  cachedFontSize = fontSize;
  cachedCharPositions = [...charPositions];
  cachedTotalWidth = totalWidth;
  cachedCanvasHeight = fontSize * 1.5;
  cachedTimeString = currentTimeString;

  // Устанавливаем размеры canvas
  const canvasHeight = cachedCanvasHeight;
  // Устанавливаем внутренние размеры canvas с учетом devicePixelRatio
  timeCanvas.width = totalWidth * dpr;
  timeCanvas.height = canvasHeight * dpr;
  // Устанавливаем CSS размеры (отображаемые размеры)
  timeCanvas.style.width = `${totalWidth}px`;
  timeCanvas.style.height = `${canvasHeight}px`;

  // Масштабируем контекст для четкой отрисовки
  ctx.scale(dpr, dpr);

  // Переустанавливаем шрифт после изменения размеров
  ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  // Получаем позицию canvas с цифрами
  const timeCanvasRect = timeCanvas.getBoundingClientRect();
  const canvasRect = canvasRef.value.getBoundingClientRect();

  // Вычисляем позицию линии относительно canvas с цифрами
  const lineYViewport = canvasRect.top + animatedFillHeight;
  const lineYRelative = lineYViewport - timeCanvasRect.top;

  // Очищаем canvas (прозрачный фон)
  ctx.clearRect(0, 0, totalWidth, canvasHeight);

  // Рисуем цифры с градиентом
  drawCharsWithGradient(
    ctx,
    charPositions,
    fontSize,
    canvasHeight,
    lineYRelative
  );
};

// Вынесенная функция для отрисовки цифр с градиентом (для переиспользования)
const drawCharsWithGradient = (
  ctx: CanvasRenderingContext2D,
  charPositions: {
    x: number;
    y: number;
    width: number;
    char: string;
    fixedWidth: number;
  }[],
  fontSize: number,
  canvasHeight: number,
  lineYRelative: number
) => {
  // Цвета из настроек таймера
  const timerColors = timer.value?.colors || DEFAULT_COLORS;
  const initialColor = timerColors.lightColor; // Изначальный цвет цифр
  const fillColor = timerColors.fillColor; // Цвет цифр ниже линии

  // Позиция текста по вертикали (центрирование)
  const textY = (canvasHeight - fontSize) / 2;

  // Проверяем валидность позиции линии
  if (isNaN(lineYRelative) || !isFinite(lineYRelative)) {
    // Рисуем все цифры изначальным цветом, центрируя в фиксированной позиции
    charPositions.forEach((pos) => {
      ctx.fillStyle = initialColor;
      // Центрируем цифру в фиксированной позиции
      const charX =
        pos.char === ":" ? pos.x : pos.x + (pos.fixedWidth - pos.width) / 2;
      ctx.fillText(pos.char, charX, textY);
    });
    return;
  }

  // Отрисовываем каждую цифру с градиентом и анимацией
  charPositions.forEach((pos, index) => {
    const charTop = textY;
    const charBottom = textY + fontSize;
    const animation = charAnimations.value.get(index);

    // Вычисляем X позицию с центрированием для цифр
    const charX =
      pos.char === ":" ? pos.x : pos.x + (pos.fixedWidth - pos.width) / 2;

    // Если есть анимация для этой позиции
    if (animation && animation.progress < 1) {
      const charHeight = fontSize;
      const offset = charHeight * animation.progress;

      // Измеряем ширину старой и новой цифры для центрирования
      const oldCharMetrics = ctx.measureText(animation.oldChar);
      const oldCharWidth = oldCharMetrics.width;
      const oldCharX = pos.x + (pos.fixedWidth - oldCharWidth) / 2;

      const newCharMetrics = ctx.measureText(animation.newChar);
      const newCharWidth = newCharMetrics.width;
      const newCharX = pos.x + (pos.fixedWidth - newCharWidth) / 2;

      // Рисуем старую цифру, движущуюся вниз
      const oldCharTop = charTop + offset;
      const oldCharBottom = oldCharTop + charHeight;

      if (oldCharTop < canvasHeight) {
        const oldGradient = ctx.createLinearGradient(
          oldCharX,
          oldCharTop,
          oldCharX,
          oldCharBottom
        );

        let oldBoundaryPercent: number;
        if (
          isNaN(lineYRelative) ||
          !isFinite(lineYRelative) ||
          lineYRelative < oldCharTop
        ) {
          oldBoundaryPercent = 0;
        } else if (lineYRelative > oldCharBottom) {
          oldBoundaryPercent = 1;
        } else {
          const linePositionInChar = lineYRelative - oldCharTop;
          oldBoundaryPercent = Math.max(
            0,
            Math.min(1, linePositionInChar / charHeight)
          );
        }

        if (oldBoundaryPercent <= 0) {
          oldGradient.addColorStop(0, initialColor);
          oldGradient.addColorStop(1, initialColor);
        } else if (oldBoundaryPercent >= 1) {
          oldGradient.addColorStop(0, fillColor);
          oldGradient.addColorStop(1, fillColor);
        } else {
          oldGradient.addColorStop(0, fillColor);
          oldGradient.addColorStop(oldBoundaryPercent, fillColor);
          oldGradient.addColorStop(oldBoundaryPercent, initialColor);
          oldGradient.addColorStop(1, initialColor);
        }

        // Прозрачность старой цифры уменьшается по мере движения вниз с easing
        ctx.globalAlpha = easeOutExpo(1 - animation.progress);
        ctx.fillStyle = oldGradient;
        ctx.fillText(animation.oldChar, oldCharX, oldCharTop);
        ctx.globalAlpha = 1;
      }

      // Рисуем новую цифру, появляющуюся сверху
      const newCharTop = charTop - charHeight + offset;
      const newCharBottom = newCharTop + charHeight;

      if (newCharBottom > 0) {
        const newGradient = ctx.createLinearGradient(
          newCharX,
          newCharTop,
          newCharX,
          newCharBottom
        );

        let newBoundaryPercent: number;
        if (
          isNaN(lineYRelative) ||
          !isFinite(lineYRelative) ||
          lineYRelative < newCharTop
        ) {
          newBoundaryPercent = 0;
        } else if (lineYRelative > newCharBottom) {
          newBoundaryPercent = 1;
        } else {
          const linePositionInChar = lineYRelative - newCharTop;
          newBoundaryPercent = Math.max(
            0,
            Math.min(1, linePositionInChar / charHeight)
          );
        }

        if (newBoundaryPercent <= 0) {
          newGradient.addColorStop(0, initialColor);
          newGradient.addColorStop(1, initialColor);
        } else if (newBoundaryPercent >= 1) {
          newGradient.addColorStop(0, fillColor);
          newGradient.addColorStop(1, fillColor);
        } else {
          newGradient.addColorStop(0, fillColor);
          newGradient.addColorStop(newBoundaryPercent, fillColor);
          newGradient.addColorStop(newBoundaryPercent, initialColor);
          newGradient.addColorStop(1, initialColor);
        }

        // Прозрачность новой цифры увеличивается по мере появления с easing
        ctx.globalAlpha = easeOutExpo(animation.progress);
        ctx.fillStyle = newGradient;
        ctx.fillText(animation.newChar, newCharX, newCharTop);
        ctx.globalAlpha = 1;
      }
    } else {
      // Обычная отрисовка без анимации
      const gradient = ctx.createLinearGradient(
        charX,
        charTop,
        charX,
        charBottom
      );

      // Определяем позицию границы градиента
      let boundaryPercent: number;

      if (
        isNaN(lineYRelative) ||
        !isFinite(lineYRelative) ||
        lineYRelative < charTop
      ) {
        boundaryPercent = 0;
      } else if (lineYRelative > charBottom) {
        boundaryPercent = 1;
      } else {
        const linePositionInChar = lineYRelative - charTop;
        const charHeight = charBottom - charTop;
        boundaryPercent = Math.max(
          0,
          Math.min(1, linePositionInChar / charHeight)
        );
      }

      if (boundaryPercent <= 0) {
        gradient.addColorStop(0, initialColor);
        gradient.addColorStop(1, initialColor);
      } else if (boundaryPercent >= 1) {
        gradient.addColorStop(0, fillColor);
        gradient.addColorStop(1, fillColor);
      } else {
        gradient.addColorStop(0, fillColor);
        gradient.addColorStop(boundaryPercent, fillColor);
        gradient.addColorStop(boundaryPercent, initialColor);
        gradient.addColorStop(1, initialColor);
      }

      ctx.fillStyle = gradient;
      ctx.fillText(pos.char, charX, textY);
    }
  });
};

const loadTimer = (timerId: string) => {
  const foundTimer = timersStore.getTimerById(timerId);
  if (foundTimer) {
    stopTimer();
    timer.value = foundTimer;
    const total = timersStore.getTotalSeconds(foundTimer);
    remainingSeconds.value = total;
    // Очищаем анимации и предыдущие значения
    charAnimations.value.clear();
    previousTime.value = "";
    previousChars.value = [];
    // Очищаем кеш
    cachedFontSize = null;
    cachedCharPositions = null;
    cachedTotalWidth = null;
    cachedCanvasHeight = null;
    cachedTimeString = "";
    // Устанавливаем начальную высоту заполнения на 0% (цвет еще не спустился)
    // Устанавливаем начальное значение градиента иконки (весь светлый цвет)
    timerIconLinePosition.value = 0;
    nextTick(() => {
      if (canvasRef.value) {
        animatedFillHeight = 0;
        lastUpdateTime = 0;
        drawCanvas();
        // Обновляем отрисовку цифр при загрузке таймера
        drawTimeChars();
        // Обновляем градиент иконки таймера
        updateTimerIconGradient();
      }
    });
  }
};

let resizeHandler: (() => void) | null = null;

onMounted(() => {
  const timerId = route.params.id as string;
  loadTimer(timerId);

  // Инициализируем canvas после монтирования
  nextTick(() => {
    if (canvasRef.value) {
      // Обработка изменения размера окна
      resizeHandler = () => {
        // Очищаем кеш при изменении размера окна
        cachedFontSize = null;
        cachedCharPositions = null;
        cachedTotalWidth = null;
        cachedCanvasHeight = null;
        cachedTimeString = "";

        // При изменении размера окна пересчитываем анимацию
        const elapsedSeconds = totalSeconds.value - remainingSeconds.value;
        const targetFillPercentage =
          totalSeconds.value > 0 ? elapsedSeconds / totalSeconds.value : 0;
        animatedFillHeight = window.innerHeight * targetFillPercentage;
        lastUpdateTime = 0;
        drawCanvas();
        // Обновляем отрисовку цифр после изменения размера
        drawTimeChars();
        // Обновляем градиент иконки таймера
        updateTimerIconGradient();
      };
      window.addEventListener("resize", resizeHandler);

      // Устанавливаем начальную высоту заполнения на 0% (цвет еще не спустился)
      animatedFillHeight = 0;
      lastUpdateTime = 0;
      // Устанавливаем начальное значение градиента иконки (весь светлый цвет)
      timerIconLinePosition.value = 0;

      // Первоначальная отрисовка
      drawCanvas();

      // Инициализируем отрисовку цифр после небольшой задержки для готовности элементов
      setTimeout(() => {
        drawTimeChars();
        // Обновляем градиент иконки таймера после отрисовки цифр
        updateTimerIconGradient();
      }, 300);

      // Запускаем анимацию canvas
      animateCanvas();
    }
  });
});

// Обновляем таймер при изменении роута
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadTimer(newId as string);
    }
  }
);

// Watch на появление иконки в DOM для установки правильной позиции
watch(
  () => timerIconRef.value,
  (newRef) => {
    if (newRef && isRunning.value) {
      // Иконка появилась в DOM, устанавливаем позицию
      nextTick(() => {
        if (timeCanvasRef.value) {
          const timeCanvasRect = timeCanvasRef.value.getBoundingClientRect();
          if (timeCanvasRect.height > 0) {
            timerIconTop.value = timeCanvasRect.bottom + 24;
          }
        }
        updateTimerIconGradient();
      });
    }
  }
);

onUnmounted(() => {
  // Показываем таббар при размонтировании компонента (переход на другую страницу)
  setShouldHideTabBar(false);

  if (intervalId !== null) {
    clearInterval(intervalId);
  }
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
  }
});

// Обновляем canvas при изменении состояния
watch([isRunning, isPaused], () => {
  // Обновляем отрисовку цифр при изменении состояния
  drawTimeChars();

  // Обновляем позицию иконки при изменении состояния таймера
  if (isRunning.value) {
    // Когда таймер запускается, ждем отрисовки элементов перед установкой позиции
    nextTick(() => {
      // Сначала устанавливаем позицию на основе canvas с цифрами
      if (timeCanvasRef.value) {
        const timeCanvasRect = timeCanvasRef.value.getBoundingClientRect();
        if (timeCanvasRect.height > 0) {
          timerIconTop.value = timeCanvasRect.bottom + 24;
        }
      }
      // Затем обновляем градиент после небольшой задержки для гарантии отрисовки иконки
      setTimeout(() => {
        updateTimerIconGradient();
      }, 150);
    });
  } else {
    // Обновляем градиент иконки таймера при остановке/паузе
    updateTimerIconGradient();
  }

  // Перезапускаем анимацию если таймер запущен
  if (isRunning.value) {
    if (animationFrameId === null) {
      lastUpdateTime = 0;
      animateCanvas();
    }
  } else {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    // При паузе или остановке обновляем canvas один раз
    drawCanvas();
  }
});

const showTimerCompleteNotification = () => {
  // Вибрация для мобильных устройств
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200, 100, 200]);
  }

  notification.success({
    title: "Таймер завершен!",
    content: timer.value
      ? `Таймер "${timer.value.name}" завершил отсчет`
      : "Время вышло",
    duration: 5000,
  });
};

const startTimer = () => {
  if (!timer.value) return;

  isRunning.value = true;
  isPaused.value = false;

  // Скрываем таббар при запуске таймера
  setShouldHideTabBar(true);

  // Устанавливаем позицию иконки сразу после запуска таймера
  nextTick(() => {
    // Сначала устанавливаем позицию на основе canvas с цифрами
    if (timeCanvasRef.value) {
      const timeCanvasRect = timeCanvasRef.value.getBoundingClientRect();
      if (timeCanvasRect.height > 0) {
        timerIconTop.value = timeCanvasRect.bottom + 24;
      }
    }
    // Затем обновляем градиент после небольшой задержки для гарантии отрисовки иконки
    setTimeout(() => {
      updateTimerIconGradient();
    }, 150);
  });

  // Запускаем анимацию canvas
  if (animationFrameId === null) {
    animateCanvas();
  }

  intervalId = window.setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--;
    } else {
      stopTimer();
      showTimerCompleteNotification();
    }
  }, 1000);
};

const pauseTimer = () => {
  isRunning.value = false;
  isPaused.value = true;

  // Показываем таббар при паузе
  setShouldHideTabBar(false);

  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

const resumeTimer = () => {
  isRunning.value = true;
  isPaused.value = false;

  // Скрываем таббар при возобновлении таймера
  setShouldHideTabBar(true);

  // Устанавливаем позицию иконки сразу после возобновления таймера
  nextTick(() => {
    // Сначала устанавливаем позицию на основе canvas с цифрами
    if (timeCanvasRef.value) {
      const timeCanvasRect = timeCanvasRef.value.getBoundingClientRect();
      if (timeCanvasRect.height > 0) {
        timerIconTop.value = timeCanvasRect.bottom + 24;
      }
    }
    // Затем обновляем градиент после небольшой задержки для гарантии отрисовки иконки
    setTimeout(() => {
      updateTimerIconGradient();
    }, 150);
  });

  // Запускаем анимацию canvas
  if (animationFrameId === null) {
    animateCanvas();
  }

  intervalId = window.setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--;
    } else {
      stopTimer();
      showTimerCompleteNotification();
    }
  }, 1000);
};

const stopTimer = () => {
  isRunning.value = false;
  isPaused.value = false;

  // Показываем таббар при остановке таймера
  setShouldHideTabBar(false);

  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  // Останавливаем анимацию canvas
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Очищаем анимации цифр
  charAnimations.value.clear();

  // Сброс времени до начального значения
  if (timer.value) {
    const total = timersStore.getTotalSeconds(timer.value);
    remainingSeconds.value = total;
    // Сбрасываем анимацию заполнения на 0% (цвет возвращается наверх)
    // Устанавливаем градиент иконки в начальное состояние (весь светлый цвет)
    timerIconLinePosition.value = 0;
    nextTick(() => {
      if (canvasRef.value) {
        animatedFillHeight = 0;
        lastUpdateTime = 0;
        drawCanvas();
        // Обновляем отрисовку цифр при остановке таймера
        drawTimeChars();
        // Обновляем градиент иконки таймера
        updateTimerIconGradient();
      }
    });
  }
};

const handleSelectTimer = (selectedTimer: Timer) => {
  stopTimer();
  router.push(`/timer/run/${selectedTimer.id}`);
};

const goBack = () => {
  stopTimer();
  router.push("/timer");
};
</script>

<style scoped>
/* Стили для счетчика */
.timer-display {
  perspective: 1000px;
}

.timer-display > div {
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: inline-block;
  transform-origin: center;
}

/* Анимация fade для элементов интерфейса */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
