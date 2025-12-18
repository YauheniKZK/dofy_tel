<template>
  <div class="relative p-4 pb-24 min-h-full flex flex-col items-center justify-center">
    <!-- Canvas анимация фона -->
    <canvas
      ref="canvasRef"
      class="fixed inset-0 w-full h-full pointer-events-none"
      style="z-index: 0;"
    ></canvas>
    
    <div v-if="timer" class="w-full max-w-md relative z-10">
      <!-- Заголовок с кнопкой выбора таймера -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <h1 class="text-xl font-bold text-gray-800 flex-1 truncate pr-2">{{ timer.name }}</h1>
        </div>
        <n-button
          type="default"
          size="medium"
          block
          @click="showSelectModal = true"
          class="h-10 text-sm font-medium"
        >
          <template #icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
            </svg>
          </template>
          Выбрать другой таймер
        </n-button>
      </div>

      <!-- Большой счетчик времени -->
      <div class="mb-8 flex flex-col items-center justify-center">
        <div class="timer-display relative flex items-center justify-center" style="min-height: 150px;">
          <!-- Скрытые элементы для измерения размеров текста -->
          <div class="absolute opacity-0 pointer-events-none whitespace-nowrap">
            <template v-for="(char, index) in timeChars" :key="`measure-${formattedTime}-${index}`">
            <span
              v-if="char === ':'"
                :ref="el => setTimeCharRef(el, index)"
                class="text-7xl sm:text-8xl md:text-9xl font-bold mx-1 inline-block"
            >
              {{ char }}
            </span>
            <span
              v-else
              :ref="el => setTimeCharRef(el, index)"
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
            style="display: block;"
          ></canvas>
        </div>
        <div class="text-sm sm:text-base text-gray-500 font-medium mt-4">
          {{ progressText }}
        </div>
      </div>

      <!-- Кнопки управления -->
      <div class="flex justify-center items-center gap-6 mt-8">
        <!-- Кнопка запуска (когда таймер не запущен) -->
        <n-button
          v-if="!isRunning && !isPaused"
          type="primary"
          circle
          size="large"
          class="w-20 h-20 shadow-xl hover:scale-110 active:scale-95 transition-all duration-200"
          @click="startTimer"
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
            @click="pauseTimer"
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
            @click="resumeTimer"
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
            @click="stopTimer"
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

      <!-- Кнопка назад -->
      <div class="mt-4">
        <n-button
          block
          size="medium"
          quaternary
          @click="goBack"
        >
          Назад к списку таймеров
        </n-button>
      </div>
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick, type ComponentPublicInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NButton, useNotification } from 'naive-ui';
import { useTimersStore } from '@/stores/timers';
import SelectTimerModal from '@/components/timer/SelectTimerModal.vue';
import type { Timer } from '@/stores/timers';
import { useTabBarVisibility } from '@/composables/useTabBarVisibility';

const notification = useNotification();

const route = useRoute();
const router = useRouter();
const timersStore = useTimersStore();
const { setShouldHideTabBar } = useTabBarVisibility();

const timer = ref<Timer | null>(null);
const remainingSeconds = ref(0);
const isRunning = ref(false);
const isPaused = ref(false);
const showSelectModal = ref(false);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const timeCanvasRef = ref<HTMLCanvasElement | null>(null);
const timeCharRefs = ref<(HTMLElement | null)[]>([]);
let intervalId: number | null = null;
let animationFrameId: number | null = null;
let animatedFillHeight = 0; // Текущая анимированная высота заполнения
let lastUpdateTime = 0;

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
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

const timeChars = computed(() => {
  return formattedTime.value.split('');
});

const setTimeCharRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el && el instanceof HTMLElement) {
    timeCharRefs.value[index] = el;
  }
};

// Анимация каждой цифры при изменении времени
const previousTime = ref('');
watch(() => formattedTime.value, (newTime) => {
  const oldTime = previousTime.value;
  previousTime.value = newTime;
  
  if (!oldTime) return; // Пропускаем первую инициализацию
  
  // Обновляем отрисовку цифр после изменения времени
  nextTick(() => {
    // Двойной nextTick для гарантии, что элементы отрисованы
    nextTick(() => {
      drawTimeChars();
    });
  });
});

// Анимация пульсации больше не нужна, так как цифры отрисовываются на canvas

const progressPercentage = computed(() => {
  if (!timer.value || totalSeconds.value === 0) return 0;
  const elapsed = totalSeconds.value - remainingSeconds.value;
  return Math.round((elapsed / totalSeconds.value) * 100);
});

const progressText = computed(() => {
  return `Прогресс: ${progressPercentage.value}%`;
});

// Удаляем progressColor, так как он больше не используется

// Canvas анимация
const drawCanvas = () => {
  if (!canvasRef.value) return;
  
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Устанавливаем размеры canvas на весь экран
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Очищаем canvas (прозрачный фон)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Вычисляем целевую высоту линии
  // Линия движется сверху вниз по мере работы таймера
  const elapsedSeconds = totalSeconds.value - remainingSeconds.value;
  const targetFillPercentage = totalSeconds.value > 0 
    ? elapsedSeconds / totalSeconds.value 
    : 0;
  const targetFillHeight = canvas.height * targetFillPercentage;

  // Плавная интерполяция к целевой высоте
  const currentTime = Date.now();
  if (lastUpdateTime === 0) {
    lastUpdateTime = currentTime;
    animatedFillHeight = targetFillHeight;
  }

  const deltaTime = Math.min(currentTime - lastUpdateTime, 50);
  lastUpdateTime = currentTime;

  // Плавное движение линии
  const lerpFactor = Math.min(deltaTime / 200, 0.2);
  animatedFillHeight += (targetFillHeight - animatedFillHeight) * lerpFactor;

  // Ограничиваем значения
  animatedFillHeight = Math.max(0, Math.min(canvas.height, animatedFillHeight));

  // Обновляем отрисовку цифр с эффектом изменения цвета
  drawTimeChars();

  // Цвета заливки
  const fillColor = '#213448'; // Темный цвет под линией
  const lightColor = '#EAE0CF'; // Светлый цвет над линией
  
  // Рисуем заливку светлым цветом над линией
  if (animatedFillHeight > 0) {
    ctx.fillStyle = lightColor;
    ctx.fillRect(0, 0, canvas.width, animatedFillHeight);
  }
  
  // Рисуем заливку темным цветом под линией
  if (animatedFillHeight < canvas.height) {
    const fillAreaHeight = canvas.height - animatedFillHeight;
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, animatedFillHeight, canvas.width, fillAreaHeight);
  } else {
    // Если линия достигла низа, заливаем весь экран темным цветом
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  // Рисуем горизонтальную линию
  if (animatedFillHeight > 0 && animatedFillHeight < canvas.height) {
    ctx.strokeStyle = '#213448';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, animatedFillHeight);
    ctx.lineTo(canvas.width, animatedFillHeight);
    ctx.stroke();
  }
};

const animateCanvas = () => {
  drawCanvas();
  drawTimeChars(); // Обновляем отрисовку цифр при каждом кадре анимации
  if (isRunning.value) {
    animationFrameId = requestAnimationFrame(animateCanvas);
  } else {
    animationFrameId = null;
  }
};

// Удаляем timeColor, так как цвет цифр теперь управляется анимацией

// Функция для отрисовки цифр на canvas с плавным изменением цвета
const drawTimeChars = () => {
  if (!timeCanvasRef.value || !canvasRef.value) {
    return;
  }
  
  if (!timeChars.value || timeChars.value.length === 0) {
    return;
  }
  
  const timeCanvas = timeCanvasRef.value;
  const ctx = timeCanvas.getContext('2d');
  if (!ctx) {
    return;
  }

  // Определяем размер шрифта в зависимости от размера экрана
  const fontSize = window.innerWidth >= 768 
    ? 128 // md:text-9xl
    : window.innerWidth >= 640 
      ? 96 // sm:text-8xl
      : 72; // text-7xl
  
  ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  
  // Измеряем каждую цифру отдельно
  let totalWidth = 0;
  const charPositions: { x: number; y: number; width: number; char: string }[] = [];
  
  timeChars.value.forEach((char) => {
    const metrics = ctx.measureText(char);
    const width = metrics.width;
    
    charPositions.push({ 
      x: totalWidth, 
      y: 0, 
      width, 
      char
    });
    totalWidth += width;
    
    // Добавляем отступ для двоеточия
    if (char === ':') {
      const spacing = fontSize * 0.25;
      totalWidth += spacing;
    }
  });
  
  if (totalWidth === 0) return;
  
  // Устанавливаем размеры canvas
  const canvasHeight = fontSize * 1.5;
  timeCanvas.width = totalWidth;
  timeCanvas.height = canvasHeight;
  timeCanvas.style.width = `${totalWidth}px`;
  timeCanvas.style.height = `${canvasHeight}px`;
  
  // Переустанавливаем шрифт после изменения размеров
  ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  
  // Получаем позицию canvas с цифрами
  const timeCanvasRect = timeCanvas.getBoundingClientRect();
  const canvasRect = canvasRef.value.getBoundingClientRect();
  
  // Вычисляем позицию линии относительно canvas с цифрами
  const lineYViewport = canvasRect.top + animatedFillHeight;
  const lineYRelative = lineYViewport - timeCanvasRect.top;
  
  // Очищаем canvas (прозрачный фон)
  ctx.clearRect(0, 0, totalWidth, canvasHeight);
  
  // Цвета
  const initialColor = '#EAE0CF'; // Изначальный цвет цифр
  const fillColor = '#213448'; // Цвет цифр ниже линии
  
  // Позиция текста по вертикали (центрирование)
  const textY = (canvasHeight - fontSize) / 2;
  
  // Проверяем валидность позиции линии
  if (isNaN(lineYRelative) || !isFinite(lineYRelative)) {
    // Рисуем все цифры изначальным цветом
    charPositions.forEach((pos) => {
      ctx.fillStyle = initialColor;
      ctx.fillText(pos.char, pos.x, textY);
    });
    return;
  }
  
  // Отрисовываем каждую цифру с градиентом
  charPositions.forEach((pos) => {
    const charTop = textY;
    const charBottom = textY + fontSize;
    
    const gradient = ctx.createLinearGradient(pos.x, charTop, pos.x, charBottom);
    
    // Определяем позицию границы градиента
    // Изначально boundaryPercent = 0 (вся цифра initialColor #EAE0CF - светлая)
    // По мере движения линии сверху вниз, boundaryPercent увеличивается от 0 до 1
    // Темный цвет (fillColor) появляется сверху и опускается вниз
    let boundaryPercent: number;
    
    if (isNaN(lineYRelative) || !isFinite(lineYRelative) || lineYRelative < charTop) {
      // Линия еще не дошла до цифры или не определена - вся цифра светлая (#EAE0CF)
      boundaryPercent = 0;
    } else if (lineYRelative > charBottom) {
      // Линия уже прошла цифру - вся цифра темная
      boundaryPercent = 1;
    } else {
      // Линия пересекает цифру - граница на позиции линии
      const linePositionInChar = lineYRelative - charTop;
      const charHeight = charBottom - charTop;
      // Когда линия вверху цифры -> boundaryPercent = 0, когда внизу -> 1
      boundaryPercent = Math.max(0, Math.min(1, linePositionInChar / charHeight));
    }
    
    // Градиент с четкой границей: выше границы - fillColor (темный), на границе и ниже - initialColor (светлый #EAE0CF)
    // Градиент движется сверху вниз: темный цвет опускается сверху
    if (boundaryPercent <= 0) {
      // Вся цифра светлая (#EAE0CF)
      gradient.addColorStop(0, initialColor);
      gradient.addColorStop(1, initialColor);
    } else if (boundaryPercent >= 1) {
      // Вся цифра темная
      gradient.addColorStop(0, fillColor);
      gradient.addColorStop(1, fillColor);
    } else {
      // Градиент с четкой границей
      gradient.addColorStop(0, fillColor);
      gradient.addColorStop(boundaryPercent, fillColor);
      gradient.addColorStop(boundaryPercent, initialColor);
      gradient.addColorStop(1, initialColor);
    }
    
    ctx.fillStyle = gradient;
    ctx.fillText(pos.char, pos.x, textY);
  });
};

const loadTimer = (timerId: string) => {
  const foundTimer = timersStore.getTimerById(timerId);
  if (foundTimer) {
    stopTimer();
    timer.value = foundTimer;
    const total = timersStore.getTotalSeconds(foundTimer);
    remainingSeconds.value = total;
    // Устанавливаем начальную высоту заполнения на 0% (цвет еще не спустился)
    nextTick(() => {
      if (canvasRef.value) {
        animatedFillHeight = 0;
        lastUpdateTime = 0;
        drawCanvas();
        // Обновляем отрисовку цифр при загрузке таймера
        drawTimeChars();
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
        // При изменении размера окна пересчитываем анимацию
        const elapsedSeconds = totalSeconds.value - remainingSeconds.value;
        const targetFillPercentage = totalSeconds.value > 0 
          ? elapsedSeconds / totalSeconds.value 
          : 0;
        animatedFillHeight = canvasRef.value!.height * targetFillPercentage;
        lastUpdateTime = 0;
        drawCanvas();
        // Обновляем отрисовку цифр после изменения размера
        drawTimeChars();
      };
      window.addEventListener('resize', resizeHandler);
      
      // Устанавливаем начальную высоту заполнения на 0% (цвет еще не спустился)
      animatedFillHeight = 0;
      lastUpdateTime = 0;
      
      // Первоначальная отрисовка
      drawCanvas();
      
      // Инициализируем отрисовку цифр после небольшой задержки для готовности элементов
      setTimeout(() => {
        drawTimeChars();
      }, 300);
      
      // Запускаем анимацию canvas
      animateCanvas();
    }
  });
});

// Обновляем таймер при изменении роута
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadTimer(newId as string);
  }
});

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
    window.removeEventListener('resize', resizeHandler);
  }
});

// Обновляем canvas при изменении состояния
watch([isRunning, isPaused], () => {
  // Обновляем отрисовку цифр при изменении состояния
  drawTimeChars();
  
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
    title: 'Таймер завершен!',
    content: timer.value ? `Таймер "${timer.value.name}" завершил отсчет` : 'Время вышло',
    duration: 5000,
  });
};

const startTimer = () => {
  if (!timer.value) return;
  
  isRunning.value = true;
  isPaused.value = false;
  
  // Скрываем таббар при запуске таймера
  setShouldHideTabBar(true);
  
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
  
  // Сброс времени до начального значения
  if (timer.value) {
    const total = timersStore.getTotalSeconds(timer.value);
    remainingSeconds.value = total;
    // Сбрасываем анимацию заполнения на 0% (цвет возвращается наверх)
    nextTick(() => {
      if (canvasRef.value) {
        animatedFillHeight = 0;
        lastUpdateTime = 0;
        drawCanvas();
        // Обновляем отрисовку цифр при остановке таймера
        drawTimeChars();
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
  router.push('/timer');
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
</style>

