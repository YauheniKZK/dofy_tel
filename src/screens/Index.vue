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

const router = useRouter();
const route = useRoute();

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
  <div class="flex flex-col grow h-full">
    <router-view class="flex flex-col grow overflow-auto pb-16" />

    <div
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
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
</style>
