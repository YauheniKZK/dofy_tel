<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRouter, useRoute } from "vue-router";
import {
  StorefrontOutline,
  StatsChartOutline,
  HomeOutline,
  SettingsOutline,
  PersonOutline,
} from "@vicons/ionicons5";
import { NIcon, NButton } from "naive-ui";
import { useSafeArea } from "@/composables/useSafeArea";
import { useTabBarVisibility } from "@/composables/useTabBarVisibility";
import WebApp from "@twa-dev/sdk";

const router = useRouter();
const route = useRoute();
const { safeAreaInsets } = useSafeArea();
const { isTabBarVisible } = useTabBarVisibility();

const isDark = computed(() => {
  if (typeof WebApp !== "undefined" && WebApp.colorScheme) {
    return WebApp.colorScheme === "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
});

const tabs = [
  { name: "market", label: "Маркет", icon: StorefrontOutline, path: "/market" },
  { name: "stats", label: "Стат", icon: StatsChartOutline, path: "/stats" },
  { name: "home", label: "Главная", icon: HomeOutline, path: "/home" },
  {
    name: "management",
    label: "Управление",
    icon: SettingsOutline,
    path: "/management",
  },
  { name: "profile", label: "Профиль", icon: PersonOutline, path: "/profile" },
];

const activeTab = computed(() => {
  return tabs.findIndex(
    (tab) => route.path === tab.path || route.path.startsWith(tab.path)
  );
});

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div
      class="flex-1 overflow-y-auto min-h-0"
      style="height: 0;"
      :style="{
        paddingBottom: `${64 + 16 + safeAreaInsets.bottom}px`,
      }"
    >
      <router-view />
    </div>

    <div
      class="tabbar-container fixed backdrop-blur-md border-t shadow-2xl rounded-2xl z-50 transition-all duration-300 ease-in-out"
      :class="[
        isDark
          ? 'bg-gray-800/95 border-gray-700'
          : 'bg-white/95 border-gray-200',
        isTabBarVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0 pointer-events-none',
      ]"
      :style="{
        left: `${16 + safeAreaInsets.left}px`,
        right: `${16 + safeAreaInsets.right}px`,
        bottom: `${16 + safeAreaInsets.bottom}px`,
      }"
    >
      <div class="flex justify-around items-center h-16 px-2">
        <n-button
          v-for="(tab, index) in tabs"
          :key="tab.name"
          :type="activeTab === index ? 'primary' : 'default'"
          :tertiary="activeTab !== index"
          :ghost="activeTab === index"
          class="flex flex-col items-center justify-center h-full min-w-0 flex-1"
          @click="navigateTo(tab.path)"
        >
          <n-icon :component="tab.icon" :size="20" />
          <span class="text-xs mt-1">{{ tab.label }}</span>
        </n-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.n-button) {
  height: 100%;
  padding: 0.5rem;
}

:deep(.n-button__content) {
  flex-direction: column;
  gap: 0.25rem;
}

.overflow-y-auto {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
