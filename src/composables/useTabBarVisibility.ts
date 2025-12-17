import { ref, computed, onUnmounted } from 'vue';

// Глобальное состояние для всех экземпляров composable
const isTabBarVisible = ref(true);
const isTimerControlsVisible = ref(true);
const shouldHideTabBar = ref(false);
const shouldHideTimerControls = ref(false);
let hideTimeoutId: number | null = null;
let clickHandler: ((e: MouseEvent | TouchEvent) => void) | null = null;
let activeInstances = 0;

const SHOW_DURATION = 3000; // 3 секунды

// Показываем таббар и элементы управления таймером при клике, если они должны быть скрыты
const handleScreenInteraction = (e: MouseEvent | TouchEvent) => {
  // Игнорируем клики по самому таббару и элементам управления таймером
  const target = e.target as HTMLElement;
  if (target.closest('.tabbar-container') || target.closest('.timer-controls')) {
    return;
  }
  
  let shouldUpdate = false;
  
  // Показываем таббар при клике, если он должен быть скрыт
  if (shouldHideTabBar.value && !isTabBarVisible.value) {
    isTabBarVisible.value = true;
    shouldUpdate = true;
  }
  
  // Показываем элементы управления таймером при клике, если они должны быть скрыты
  if (shouldHideTimerControls.value && !isTimerControlsVisible.value) {
    isTimerControlsVisible.value = true;
    shouldUpdate = true;
  }
  
  if (shouldUpdate) {
    // Очищаем предыдущий таймер
    if (hideTimeoutId !== null) {
      clearTimeout(hideTimeoutId);
      hideTimeoutId = null;
    }
    
    // Прячем элементы через 3 секунды, если больше не было взаимодействий
    hideTimeoutId = window.setTimeout(() => {
      if (shouldHideTabBar.value) {
        isTabBarVisible.value = false;
      }
      if (shouldHideTimerControls.value) {
        isTimerControlsVisible.value = false;
      }
      hideTimeoutId = null;
    }, SHOW_DURATION);
  }
};

export function useTabBarVisibility() {
  activeInstances++;
  
  // Устанавливаем режим скрытия таббара
  const setShouldHideTabBar = (value: boolean) => {
    shouldHideTabBar.value = value;
    
    if (value) {
      // Если нужно скрыть таббар, прячем его
      isTabBarVisible.value = false;
      
      // Добавляем обработчики кликов (только один раз)
      if (!clickHandler) {
        clickHandler = handleScreenInteraction;
        window.addEventListener('click', clickHandler, true);
        window.addEventListener('touchstart', clickHandler, true);
      }
    } else {
      // Если не нужно скрывать, показываем таббар
      isTabBarVisible.value = true;
      
      // Удаляем обработчики кликов только если больше ничего не нужно скрывать
      if (!shouldHideTimerControls.value && clickHandler) {
        window.removeEventListener('click', clickHandler, true);
        window.removeEventListener('touchstart', clickHandler, true);
        clickHandler = null;
      }
      
      // Очищаем таймер
      if (hideTimeoutId !== null) {
        clearTimeout(hideTimeoutId);
        hideTimeoutId = null;
      }
    }
  };

  // Устанавливаем режим скрытия элементов управления таймером
  const setShouldHideTimerControls = (value: boolean) => {
    shouldHideTimerControls.value = value;
    
    if (value) {
      // Если нужно скрыть элементы управления, прячем их
      isTimerControlsVisible.value = false;
      
      // Добавляем обработчики кликов (только один раз)
      if (!clickHandler) {
        clickHandler = handleScreenInteraction;
        window.addEventListener('click', clickHandler, true);
        window.addEventListener('touchstart', clickHandler, true);
      }
    } else {
      // Если не нужно скрывать, показываем элементы управления
      isTimerControlsVisible.value = true;
      
      // Удаляем обработчики кликов только если больше ничего не нужно скрывать
      if (!shouldHideTabBar.value && clickHandler) {
        window.removeEventListener('click', clickHandler, true);
        window.removeEventListener('touchstart', clickHandler, true);
        clickHandler = null;
      }
      
      // Очищаем таймер
      if (hideTimeoutId !== null) {
        clearTimeout(hideTimeoutId);
        hideTimeoutId = null;
      }
    }
  };

  // Очистка при размонтировании
  onUnmounted(() => {
    activeInstances--;
    
    // Если больше нет активных экземпляров, очищаем все
    if (activeInstances === 0) {
      if (clickHandler) {
        window.removeEventListener('click', clickHandler, true);
        window.removeEventListener('touchstart', clickHandler, true);
        clickHandler = null;
      }
      if (hideTimeoutId !== null) {
        clearTimeout(hideTimeoutId);
        hideTimeoutId = null;
      }
      // Сбрасываем состояние
      shouldHideTabBar.value = false;
      shouldHideTimerControls.value = false;
      isTabBarVisible.value = true;
      isTimerControlsVisible.value = true;
    }
  });

  return {
    isTabBarVisible: computed(() => isTabBarVisible.value),
    isTimerControlsVisible: computed(() => isTimerControlsVisible.value),
    setShouldHideTabBar,
    setShouldHideTimerControls,
  };
}

