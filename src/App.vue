<script setup lang="ts">
import {
  NConfigProvider,
  NModalProvider,
  NNotificationProvider,
} from 'naive-ui';
import Main from '@/layout/Main.vue';
import WebApp from '@twa-dev/sdk'
import { onMounted } from 'vue';

const version = import.meta.env.PACKAGE_VERSION || '0.0.0';

onMounted(async () => {
  
  if (WebApp) {
    WebApp.expand()
    const user = WebApp?.initDataUnsafe?.user;
    console.log('User:', user);
    const id = user?.id
    const firstName = user?.first_name || ''
    console.log('id:', id);
    console.log('userName:', firstName);
  }
})

</script>

<template>
  <n-config-provider class="flex flex-col grow">
    <n-notification-provider>
      <n-modal-provider>
        <div class="relative flex flex-col grow">
          <div class="fixed top-0 right-0 z-50 px-2 py-1 text-xs text-gray-400 bg-white/80 backdrop-blur-sm rounded-bl-lg">
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
