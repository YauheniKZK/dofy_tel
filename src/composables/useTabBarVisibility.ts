import { ref, computed, onUnmounted } from 'vue';

// Глобальное состояние для всех экземпляров composable
const isTabBarVisible = ref(true);
const shouldHideTabBar = ref(false);
let hideTimeoutId: number | null = null;
let clickHandler: ((e: MouseEvent | TouchEvent) => void) | null = null;
let activeInstances = 0;

const SHOW_DURATION = 3000; // 3 секунды

// Показываем таббар при клике, если он должен быть скрыт
const handleScreenInteraction = (e: MouseEvent | TouchEvent) => {
  // Игнорируем клики по самому таббару
  const target = e.target as HTMLElement;
  if (target.closest('.tabbar-container')) {
    return;
  }
  
  if (shouldHideTabBar.value && !isTabBarVisible.value) {
    // Показываем таббар
    isTabBarVisible.value = true;
    
    // Очищаем предыдущий таймер
    if (hideTimeoutId !== null) {
      clearTimeout(hideTimeoutId);
      hideTimeoutId = null;
    }
    
    // Прячем таббар через 3 секунды, если больше не было взаимодействий
    hideTimeoutId = window.setTimeout(() => {
      if (shouldHideTabBar.value) {
        isTabBarVisible.value = false;
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
      
      // Удаляем обработчики кликов
      if (clickHandler) {
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
      isTabBarVisible.value = true;
    }
  });

  return {
    isTabBarVisible: computed(() => isTabBarVisible.value),
    setShouldHideTabBar,
  };
}

