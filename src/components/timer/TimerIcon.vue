<template>
  <div
    v-if="iconSvgContent"
    ref="iconContainerRef"
    class="timer-icon"
    :style="{
      opacity: 0.9,
    }"
    v-html="iconSvgWithGradient"
  ></div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from "vue";
import { getIconById } from "@/config/timerIcons";
import type { TimerColors } from "@/stores/timers";
import { animate, svg, stagger } from "animejs";

const props = defineProps<{
  iconId?: string;
  gradientStop: number; // 0-1 позиция границы градиента
  colors: TimerColors;
  viewBox?: string; // viewBox для SVG (по умолчанию "0 0 470 470")
}>();

const iconSvgContent = ref<string>("");
const iconContainerRef = ref<HTMLElement | null>(null);
const gradientId = ref(
  `timerIconGradient-${Math.random().toString(36).substr(2, 9)}`
);
let animationInstances: any[] = [];
let hasAnimated = false; // Флаг для отслеживания, была ли уже запущена анимация

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
      <g fill="url(#${gradientId.value})" id="timer-icon-group-${
    gradientId.value
  }">
        ${svgInnerContent}
      </g>
    </svg>
  `;

  return newSvg;
});

// Анимация SVG path с помощью animejs createDrawable
const animateIconPaths = () => {
  // Запускаем анимацию только один раз
  if (hasAnimated) {
    return;
  }

  if (!iconContainerRef.value) {
    console.log("animateIconPaths: iconContainerRef is null");
    return;
  }

  // Ждем несколько тиков и небольшую задержку, чтобы DOM полностью обновился после v-html
  nextTick(() => {
    setTimeout(() => {
      if (!iconContainerRef.value) {
        console.log("animateIconPaths: iconContainerRef is null after timeout");
        return;
      }

      const svgElement = iconContainerRef.value.querySelector("svg");
      if (!svgElement) {
        console.log("animateIconPaths: SVG element not found");
        return;
      }

      // Находим группу и временно убираем fill, чтобы stroke был виден
      const group = svgElement.querySelector(
        `g[id^='timer-icon-group-']`
      ) as SVGGElement;
      if (group) {
        const originalGroupFill = group.getAttribute("fill");
        if (originalGroupFill) {
          group.setAttribute("data-original-group-fill", originalGroupFill);
        }
        group.setAttribute("fill", "none"); // Убираем fill из группы во время анимации
      }

      // Находим все path элементы
      const paths = svgElement.querySelectorAll("path");
      console.log(`animateIconPaths: Found ${paths.length} path elements`);

      if (paths.length === 0) {
        console.log("animateIconPaths: No path elements found");
        return;
      }

      // Останавливаем предыдущие анимации если есть
      animationInstances.forEach((anim) => {
        try {
          if (anim && typeof anim.pause === "function") {
            anim.pause();
          }
        } catch (e) {
          console.error("Error pausing animation:", e);
        }
      });
      animationInstances = [];

      try {
        // Добавляем уникальные ID и stroke к каждому path для селектора
        // Анимация draw работает только со stroke, поэтому нужно добавить stroke
        paths.forEach((pathElement, index) => {
          const path = pathElement as SVGPathElement;
          const uniqueId = `timer-path-${Date.now()}-${index}`;
          path.setAttribute("id", uniqueId);

          // Сохраняем оригинальный fill
          const originalFill =
            path.getAttribute("fill") || `url(#${gradientId.value})`;
          path.setAttribute("data-original-fill", originalFill);

          // Убираем fill полностью во время анимации, чтобы stroke был виден
          path.setAttribute("fill", "none");

          // Добавляем stroke для видимости анимации draw
          // Используем прямой цвет вместо градиента для лучшей видимости
          const strokeColor = props.colors.fillColor; // Используем темный цвет для контраста
          path.setAttribute("stroke", strokeColor);
          path.setAttribute("stroke-width", "10"); // Увеличиваем ширину для лучшей видимости
          path.setAttribute("stroke-linecap", "round");
          path.setAttribute("stroke-linejoin", "round");
          path.setAttribute("stroke-opacity", "1");
        });

        // Создаем drawable используя селектор всех path элементов
        // animejs ожидает селектор строку, а не функцию
        const drawables = svg.createDrawable("path[id^='timer-path-']");

        console.log(
          `animateIconPaths: Created ${drawables?.length || 0} drawables from ${
            paths.length
          } paths`
        );

        if (!drawables || drawables.length === 0) {
          console.warn("animateIconPaths: No drawables created");
          // Убираем ID в случае ошибки
          paths.forEach((pathElement) => {
            (pathElement as SVGPathElement).removeAttribute("id");
          });
          return;
        }

        // Анимируем все path одновременно с задержкой между ними
        const anim = animate(drawables, {
          draw: ["0 0", "0 1"],
          ease: "easeOutExpo",
          duration: 2500, // Увеличиваем длительность до 2.5 секунд
          delay: stagger(150), // Увеличиваем задержку между path
          complete: () => {
            // Восстанавливаем fill в группе
            if (group) {
              const originalGroupFill = group.getAttribute(
                "data-original-group-fill"
              );
              if (originalGroupFill) {
                group.setAttribute("fill", originalGroupFill);
              }
              group.removeAttribute("data-original-group-fill");
            }

            // После завершения анимации восстанавливаем fill и убираем stroke
            paths.forEach((pathElement) => {
              const path = pathElement as SVGPathElement;
              const originalFill = path.getAttribute("data-original-fill");
              if (originalFill) {
                path.setAttribute("fill", originalFill);
                path.removeAttribute("data-original-fill");
              }
              // Убираем stroke после анимации
              path.removeAttribute("stroke");
              path.removeAttribute("stroke-width");
              path.removeAttribute("stroke-linecap");
              path.removeAttribute("stroke-linejoin");
              path.removeAttribute("stroke-opacity");
              // Убираем ID
              path.removeAttribute("id");
            });
          },
        });

        console.log("animateIconPaths: Animation started:", anim);
        animationInstances.push(anim);
        hasAnimated = true; // Отмечаем, что анимация была запущена
      } catch (error) {
        console.error("animateIconPaths: Error creating animation:", error);
        // Убираем ID в случае ошибки
        paths.forEach((pathElement) => {
          (pathElement as SVGPathElement).removeAttribute("id");
        });
      }
    }, 200); // Увеличиваем задержку для гарантии обновления DOM
  });
};

// Загружаем иконку при монтировании и при изменении iconId
watch(
  () => props.iconId,
  async () => {
    hasAnimated = false; // Сбрасываем флаг при смене иконки
    await loadIcon();
    // Запускаем анимацию после загрузки
    animateIconPaths();
  },
  { immediate: true }
);

onMounted(() => {
  loadIcon();
});

onUnmounted(() => {
  // Останавливаем все анимации при размонтировании
  animationInstances.forEach((anim) => {
    if (anim && typeof anim.pause === "function") {
      anim.pause();
    }
  });
  animationInstances = [];
});
</script>

<style scoped>
.timer-icon :deep(svg) {
  display: block;
  width: 144px;
  height: 144px;
}
</style>
