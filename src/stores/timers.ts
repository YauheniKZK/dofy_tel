import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface TimerColors {
  lightColor: string; // Цвет для верхней части и цифр над линией
  fillColor: string; // Цвет для нижней части и цифр под линией
}

export interface Timer {
  id: string;
  name: string;
  duration: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  colors?: TimerColors; // Опциональное поле для обратной совместимости
  iconId?: string; // ID выбранной иконки таймера
  createdAt: number;
}

// Готовые варианты цветов
export const COLOR_PRESETS: TimerColors[] = [
  { lightColor: '#EAE0CF', fillColor: '#213448' }, // По умолчанию (текущий)
  { lightColor: '#E0D9D9', fillColor: '#432323' },
  { lightColor: '#FFF4B7', fillColor: '#000B58' },
  { lightColor: '#EEEEEE', fillColor: '#222831' },
  { lightColor: '#F39F5A', fillColor: '#662549' },
];

// Цвета по умолчанию
export const DEFAULT_COLORS: TimerColors = COLOR_PRESETS[0]!;

const STORAGE_KEY = 'timers';

export const useTimersStore = defineStore('timers', () => {
  // ------------STATE------------
  const timers = ref<Timer[]>([]);

  // Загружаем таймеры из localStorage
  const loadTimers = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Миграция: добавляем цвета по умолчанию для старых таймеров
        timers.value = parsed.map((timer: Timer) => ({
          ...timer,
          colors: timer.colors || DEFAULT_COLORS,
        }));
        // Сохраняем обновленные данные
        saveTimers();
      }
    } catch (e) {
      console.error('Failed to load timers:', e);
    }
  };

  // Сохраняем таймеры в localStorage
  const saveTimers = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timers.value));
    } catch (e) {
      console.error('Failed to save timers:', e);
    }
  };

  // Инициализация
  loadTimers();

  // ------------GETTERS------------
  const timersList = computed(() => timers.value);

  const lastTimer = computed(() => {
    if (timers.value.length === 0) return null;
    // Сортируем по дате создания (последний добавленный)
    const sorted = [...timers.value].sort((a, b) => b.createdAt - a.createdAt);
    return sorted[0];
  });

  // ------------ACTIONS------------
  function addTimer(timer: Omit<Timer, 'id' | 'createdAt'>) {
    const newTimer: Timer = {
      ...timer,
      colors: timer.colors || DEFAULT_COLORS,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    timers.value.push(newTimer);
    saveTimers();
  }

  function deleteTimer(id: string) {
    timers.value = timers.value.filter((t) => t.id !== id);
    saveTimers();
  }

  function updateTimer(id: string, timer: Omit<Timer, 'id' | 'createdAt'>) {
    const existingTimer = timers.value.find((t) => t.id === id);
    if (existingTimer) {
      const index = timers.value.indexOf(existingTimer);
      timers.value[index] = {
        id: existingTimer.id,
        createdAt: existingTimer.createdAt,
        colors: timer.colors || existingTimer.colors || DEFAULT_COLORS,
        ...timer,
      };
      saveTimers();
    }
  }

  function getTimerById(id: string): Timer | undefined {
    return timers.value.find((t) => t.id === id);
  }

  function getTotalSeconds(timer: Timer): number {
    return timer.duration.hours * 3600 + timer.duration.minutes * 60 + timer.duration.seconds;
  }

  return {
    timersList,
    lastTimer,
    addTimer,
    deleteTimer,
    updateTimer,
    getTimerById,
    getTotalSeconds,
  };
});

