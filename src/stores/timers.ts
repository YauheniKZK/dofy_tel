import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Timer {
  id: string;
  name: string;
  duration: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  createdAt: number;
}

const STORAGE_KEY = 'timers';

export const useTimersStore = defineStore('timers', () => {
  // ------------STATE------------
  const timers = ref<Timer[]>([]);

  // Загружаем таймеры из localStorage
  const loadTimers = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        timers.value = JSON.parse(stored);
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
    const index = timers.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      timers.value[index] = {
        ...timers.value[index],
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

