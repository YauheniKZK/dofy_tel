import { ref, onMounted, onUnmounted } from 'vue';
import WebApp from '@twa-dev/sdk';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export function useSafeArea() {
  const safeAreaInsets = ref<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  const updateSafeArea = () => {
    try {
      // Проверяем наличие WebApp API
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        if (tg.safeAreaInsets) {
          safeAreaInsets.value = {
            top: tg.safeAreaInsets.top || 0,
            bottom: tg.safeAreaInsets.bottom || 0,
            left: tg.safeAreaInsets.left || 0,
            right: tg.safeAreaInsets.right || 0,
          };
          return;
        }
      }

      // Fallback на SDK
      if (WebApp && (WebApp as any).safeAreaInsets) {
        const insets = (WebApp as any).safeAreaInsets;
        safeAreaInsets.value = {
          top: insets.top || 0,
          bottom: insets.bottom || 0,
          left: insets.left || 0,
          right: insets.right || 0,
        };
      }
    } catch (e) {
      console.warn('Failed to get safe area insets:', e);
    }
  };

  const handleSafeAreaChanged = (event: any) => {
    if (event && event.safeAreaInsets) {
      safeAreaInsets.value = {
        top: event.safeAreaInsets.top || 0,
        bottom: event.safeAreaInsets.bottom || 0,
        left: event.safeAreaInsets.left || 0,
        right: event.safeAreaInsets.right || 0,
      };
    }
  };

  onMounted(() => {
    // Получаем начальные значения
    updateSafeArea();

    // Запрашиваем обновление safe area через нативный API
    try {
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        if (typeof tg.requestSafeArea === 'function') {
          tg.requestSafeArea();
        }
        // Подписываемся на изменения через нативный API
        if (typeof tg.onEvent === 'function') {
          tg.onEvent('safe_area_changed', handleSafeAreaChanged);
        }
      }

      // Fallback на SDK
      if (WebApp && typeof (WebApp as any).requestSafeArea === 'function') {
        (WebApp as any).requestSafeArea();
      }
      if (WebApp && typeof (WebApp as any).onEvent === 'function') {
        (WebApp as any).onEvent('safe_area_changed', handleSafeAreaChanged);
      }
    } catch (e) {
      console.warn('Failed to setup safe area listeners:', e);
    }
  });

  onUnmounted(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        if (typeof tg.offEvent === 'function') {
          tg.offEvent('safe_area_changed', handleSafeAreaChanged);
        }
      }
      if (WebApp && typeof (WebApp as any).offEvent === 'function') {
        (WebApp as any).offEvent('safe_area_changed', handleSafeAreaChanged);
      }
    } catch (e) {
      console.warn('Failed to remove safe area listeners:', e);
    }
  });

  return {
    safeAreaInsets,
    updateSafeArea,
  };
}

