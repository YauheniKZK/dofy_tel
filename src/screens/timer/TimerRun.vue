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
        <div class="timer-display flex items-center justify-center">
          <template v-for="(char, index) in timeChars" :key="`${formattedTime}-${index}`">
            <span
              v-if="char === ':'"
              class="text-7xl sm:text-8xl md:text-9xl font-bold mx-1"
              :class="timeColor"
            >
              {{ char }}
            </span>
            <span
              v-else
              :ref="el => setTimeCharRef(el, index)"
              class="text-7xl sm:text-8xl md:text-9xl font-bold tracking-tighter inline-block transition-colors duration-300 will-change-transform"
              :class="timeColor"
              style="transform-origin: center; backface-visibility: hidden;"
            >
              {{ char }}
            </span>
          </template>
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
import { animate } from 'animejs';
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
const timeCharRefs = ref<(HTMLElement | null)[]>([]);
let intervalId: number | null = null;
let animationFrameId: number | null = null;
let animatedFillHeight = 0; // Текущая анимированная высота заполнения
let lastUpdateTime = 0;
let pulseAnimations: ReturnType<typeof animate>[] = [];

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
  
  nextTick(() => {
    // Останавливаем предыдущие анимации пульсации перед новой анимацией
    pulseAnimations.forEach(anim => {
      if (anim) {
        try {
          anim.pause();
        } catch (e) {
          // Игнорируем ошибки при остановке
        }
      }
    });
    pulseAnimations = [];

    // Анимируем каждую цифру отдельно
    timeCharRefs.value.forEach((charEl, index) => {
      if (charEl && newTime[index] !== oldTime[index]) {
        // Сбрасываем все стили перед анимацией
        charEl.style.transform = '';
        charEl.style.opacity = '';
        
        // Устанавливаем начальное состояние (сверху, прозрачное)
        charEl.style.transform = 'translateY(40px)';
        charEl.style.opacity = '0';
        
        // Плавная анимация появления сверху без резких движений
        animate(charEl, {
          translateY: [40, 0],
          opacity: [0, 1],
          scale: [0.85, 1],
          duration: 500,
          easing: 'easeOutCubic',
          delay: index * 20, // Небольшая задержка для каждой цифры
        });
      }
    });
  });
});

// Анимация пульсации при работе таймера
watch(() => isRunning.value, (running) => {
  nextTick(() => {
    // Останавливаем все предыдущие анимации пульсации
    pulseAnimations.forEach(anim => {
      if (anim) {
        try {
          anim.pause();
        } catch (e) {
          // Игнорируем ошибки
        }
      }
    });
    pulseAnimations = [];

    if (running) {
      // Небольшая задержка перед началом пульсации, чтобы не конфликтовать с анимацией появления
      setTimeout(() => {
        // Добавляем очень легкую пульсацию к каждой цифре
        timeCharRefs.value.forEach((charEl) => {
          if (charEl) {
            // Сбрасываем transform перед пульсацией
            charEl.style.transform = '';
            
            const anim = animate(charEl, {
              scale: [1, 1.02, 1],
              duration: 2500,
              easing: 'easeInOutSine',
              loop: true,
            });
            pulseAnimations.push(anim);
          }
        });
      }, 600);
    } else {
      // Плавно возвращаем масштаб к 1
      timeCharRefs.value.forEach((charEl) => {
        if (charEl) {
          animate(charEl, {
            scale: 1,
            duration: 400,
            easing: 'easeOutSine',
          });
        }
      });
    }
  });
});

const progressPercentage = computed(() => {
  if (!timer.value || totalSeconds.value === 0) return 0;
  const elapsed = totalSeconds.value - remainingSeconds.value;
  return Math.round((elapsed / totalSeconds.value) * 100);
});

const progressText = computed(() => {
  return `Прогресс: ${progressPercentage.value}%`;
});

const progressColor = computed(() => {
  if (isRunning.value) {
    return '#3b82f6'; // blue-500
  } else if (isPaused.value) {
    return '#f59e0b'; // amber-500
  }
  return '#10b981'; // emerald-500
});

// Canvas анимация
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const drawCanvas = () => {
  if (!canvasRef.value) return;
  
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Устанавливаем размеры canvas на весь экран
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Очищаем canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Вычисляем целевую высоту заполнения
  // Цвет "спускается" сверху вниз - заполнение увеличивается по мере работы таймера
  // Изначально 0%, увеличивается до 100% когда таймер заканчивается
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

  const deltaTime = Math.min(currentTime - lastUpdateTime, 50); // Ограничиваем для стабильности
  lastUpdateTime = currentTime;

  // Плавное увеличение с коэффициентом интерполяции для плавности
  const lerpFactor = Math.min(deltaTime / 200, 0.2); // Плавная интерполяция
  animatedFillHeight += (targetFillHeight - animatedFillHeight) * lerpFactor;

  // Ограничиваем значения для предотвращения артефактов
  animatedFillHeight = Math.max(0, Math.min(canvas.height, animatedFillHeight));

  // Цвет заливки с прозрачностью
  const color = progressColor.value;
  const rgbaColor = hexToRgba(color, 0.3);

  // Рисуем заполнение сверху вниз
  // Цвет "спускается" сверху вниз - линия движется сверху вниз, цвет заполняет нижнюю часть
  // По мере работы таймера, animatedFillHeight увеличивается, 
  // создавая эффект "спускающегося" цвета сверху вниз
  if (animatedFillHeight < canvas.height) {
    // Вычисляем высоту области заполнения (от линии до низа экрана)
    const fillAreaHeight = canvas.height - animatedFillHeight;
    
    // Создаем градиент от линии к низу заполнения
    // Более яркий цвет у линии, плавно переходящий вниз
    const gradient = ctx.createLinearGradient(0, animatedFillHeight, 0, canvas.height);
    gradient.addColorStop(0, rgbaColor); // Яркий цвет у линии
    gradient.addColorStop(0.3, hexToRgba(color, 0.25));
    gradient.addColorStop(0.7, hexToRgba(color, 0.15));
    gradient.addColorStop(1, hexToRgba(color, 0.05)); // Почти прозрачный внизу

    ctx.fillStyle = gradient;
    // Рисуем прямоугольник от линии до низа экрана
    // Это создает эффект "спускающегося" цвета сверху вниз
    ctx.fillRect(0, animatedFillHeight, canvas.width, fillAreaHeight);
    
    // Добавляем линию на границе для более четкого визуального эффекта движения
    if (animatedFillHeight > 0 && animatedFillHeight < canvas.height) {
      ctx.strokeStyle = hexToRgba(color, 0.5);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, animatedFillHeight);
      ctx.lineTo(canvas.width, animatedFillHeight);
      ctx.stroke();
    }
  } else {
    // Если заполнение достигло 100%, заливаем весь экран
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, rgbaColor);
    gradient.addColorStop(0.5, hexToRgba(color, 0.25));
    gradient.addColorStop(1, hexToRgba(color, 0.1));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
};

const animateCanvas = () => {
  drawCanvas();
  if (isRunning.value) {
    animationFrameId = requestAnimationFrame(animateCanvas);
  } else {
    animationFrameId = null;
  }
};

const timeColor = computed(() => {
  if (isRunning.value) {
    return 'text-blue-600';
  } else if (isPaused.value) {
    return 'text-amber-600';
  }
  return 'text-gray-800';
});

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
      };
      window.addEventListener('resize', resizeHandler);
      
      // Устанавливаем начальную высоту заполнения на 0% (цвет еще не спустился)
      animatedFillHeight = 0;
      lastUpdateTime = 0;
      
      // Первоначальная отрисовка
      drawCanvas();
      
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
  pulseAnimations.forEach(anim => anim?.pause());
  pulseAnimations = [];
});

// Обновляем canvas при изменении прогресса и состояния
watch([progressColor, isRunning, isPaused], () => {
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

