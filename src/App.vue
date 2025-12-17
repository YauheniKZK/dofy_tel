<script setup lang="ts">
import {
  NConfigProvider,
  NModalProvider,
  NNotificationProvider,
  darkTheme,
} from 'naive-ui';
import Main from '@/layout/Main.vue';
import WebApp from '@twa-dev/sdk'
import { ref, onMounted, computed } from 'vue';

const version = import.meta.env.PACKAGE_VERSION || '0.0.0';
const isDark = ref(false);

onMounted(async () => {
  
  if (WebApp) {
    WebApp.expand()
    const user = WebApp?.initDataUnsafe?.user;
    console.log('User:', user);
    const id = user?.id
    const firstName = user?.first_name || ''
    console.log('id:', id);
    console.log('userName:', firstName);
    
    // Определяем тему из Telegram WebApp
    isDark.value = WebApp.colorScheme === 'dark';
    
    // Слушаем изменения темы
    WebApp.onEvent('themeChanged', () => {
      isDark.value = WebApp.colorScheme === 'dark';
    });
  } else {
    // Fallback: проверяем системную тему
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
})

const theme = computed(() => isDark.value ? darkTheme : null);

</script>

<template>
  <n-config-provider :theme="theme" class="flex flex-col grow">
    <n-notification-provider>
      <n-modal-provider>
        <div class="relative flex flex-col grow" :class="{ 'dark': isDark }">
          <div 
            class="fixed top-0 right-0 z-50 px-2 py-1 text-xs rounded-bl-lg transition-colors"
            :class="isDark ? 'text-gray-300 bg-gray-800/80 backdrop-blur-sm' : 'text-gray-400 bg-white/80 backdrop-blur-sm'"
          >
            v{{ version }}
          </div>
          <Main
            class="flex flex-col grow"
          />
        </div>
      </n-modal-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<style scoped></style>
