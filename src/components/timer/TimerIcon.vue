<template>
  <div
    v-if="iconSvgContent"
    v-html="iconSvgWithGradient"
    class="timer-icon"
    :style="{
      opacity: 0.9,
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    }"
  ></div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { getIconById } from "@/config/timerIcons";
import type { TimerColors } from "@/stores/timers";
import { DEFAULT_COLORS } from "@/stores/timers";

const props = defineProps<{
  iconId?: string;
  gradientStop: number; // 0-1 позиция границы градиента
  colors: TimerColors;
  viewBox?: string; // viewBox для SVG (по умолчанию "0 0 470 470")
}>();

const iconSvgContent = ref<string>("");
const gradientId = ref(
  `timerIconGradient-${Math.random().toString(36).substr(2, 9)}`
);

// Загружаем SVG содержимое
const loadIcon = async () => {
  if (!props.iconId) {
    iconSvgContent.value = "";
    return;
  }

  const icon = getIconById(props.iconId);
  if (!icon) {
    iconSvgContent.value = "";
    return;
  }

  // Если path уже содержит SVG содержимое (raw string), используем его напрямую
  // Иначе пытаемся загрузить по URL
  if (icon.path.startsWith("<svg") || icon.path.includes("<?xml")) {
    iconSvgContent.value = icon.path;
  } else {
    try {
      // Используем fetch для загрузки SVG по URL
      const response = await fetch(icon.path);
      if (response.ok) {
        const svgText = await response.text();
        iconSvgContent.value = svgText;
      } else {
        console.error(`Failed to load icon: ${icon.path}`);
        iconSvgContent.value = "";
      }
    } catch (error) {
      console.error(`Error loading icon: ${error}`);
      iconSvgContent.value = "";
    }
  }
};

// Вычисляем SVG с примененным градиентом
const iconSvgWithGradient = computed(() => {
  if (!iconSvgContent.value) return "";

  const lightColor = props.colors.lightColor;
  const fillColor = props.colors.fillColor;
  const stop = props.gradientStop;
  const viewBox = props.viewBox || "0 0 470 470";

  // Создаем градиент stops
  let gradientStops: string;
  if (stop <= 0) {
    gradientStops = `
      <stop offset="0" stop-color="${lightColor}" />
      <stop offset="1" stop-color="${lightColor}" />
    `;
  } else if (stop >= 1) {
    gradientStops = `
      <stop offset="0" stop-color="${fillColor}" />
      <stop offset="1" stop-color="${fillColor}" />
    `;
  } else {
    gradientStops = `
      <stop offset="0" stop-color="${fillColor}" />
      <stop offset="${stop}" stop-color="${fillColor}" />
      <stop offset="${stop}" stop-color="${lightColor}" />
      <stop offset="1" stop-color="${lightColor}" />
    `;
  }

  // Парсим SVG и заменяем fill на градиент
  let svg = iconSvgContent.value;

  // Удаляем существующие defs если есть
  svg = svg.replace(/<defs>[\s\S]*?<\/defs>/gi, "");

  // Извлекаем содержимое между <svg> тегами
  const svgMatch = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  if (!svgMatch) return "";

  const svgAttributes = svg.match(/<svg([^>]*)>/i)?.[1] || "";
  const svgInnerContent = svgMatch[1];

  // Создаем новый SVG с градиентом
  const newSvg = `
    <svg width="144" height="144" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" class="transition-opacity duration-300">
      <defs>
        <linearGradient id="${gradientId.value}" x1="0" y1="0" x2="0" y2="${
    viewBox.split(" ")[3] || "470"
  }" gradientUnits="userSpaceOnUse">
          ${gradientStops}
        </linearGradient>
      </defs>
      <g fill="url(#${gradientId.value})">
        ${svgInnerContent}
      </g>
    </svg>
  `;

  return newSvg;
});

// Загружаем иконку при монтировании и при изменении iconId
watch(() => props.iconId, loadIcon, { immediate: true });
onMounted(() => {
  loadIcon();
});
</script>

<style scoped>
.timer-icon :deep(svg) {
  display: block;
  width: 144px;
  height: 144px;
}
</style>
