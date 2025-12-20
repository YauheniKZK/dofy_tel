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
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { getIconById, replaceIconColors } from "@/config/timerIcons";
import type { TimerColors } from "@/stores/timers";

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

  let rawSvgContent = "";

  // Если path уже содержит SVG содержимое (raw string), используем его напрямую
  // Иначе пытаемся загрузить по URL
  if (icon.path.startsWith("<svg") || icon.path.includes("<?xml")) {
    rawSvgContent = icon.path;
  } else {
    try {
      // Используем fetch для загрузки SVG по URL
      const response = await fetch(icon.path);
      if (response.ok) {
        rawSvgContent = await response.text();
      } else {
        console.error(`Failed to load icon: ${icon.path}`);
        iconSvgContent.value = "";
        return;
      }
    } catch (error) {
      console.error(`Error loading icon: ${error}`);
      iconSvgContent.value = "";
      return;
    }
  }
  
  // Проверяем, содержит ли SVG скрипты (например, SVGator анимация)
  const hasScript = /<script[\s\S]*?<\/script>/i.test(rawSvgContent);
  
  // Для SVG со скриптами заменяем цвета в строке (включая JSON данные анимации)
  // Это нужно сделать ДО выполнения скрипта, чтобы анимация использовала правильные цвета
  // Для обычных SVG тоже заменяем цвета сразу
  if (
    (icon.lightColors && icon.lightColors.length > 0) ||
    (icon.fillColors && icon.fillColors.length > 0)
  ) {
    iconSvgContent.value = replaceIconColors(
      rawSvgContent,
      icon,
      props.colors.lightColor,
      props.colors.fillColor
    );
  } else {
    iconSvgContent.value = rawSvgContent;
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

  // Проверяем, содержит ли SVG скрипты (например, SVGator анимация)
  const hasScript = /<script[\s\S]*?<\/script>/i.test(svg);
  
  // Для SVG со скриптами проверяем и добавляем размеры, если их нет
  // Также применяем цвета из настроек
  if (hasScript) {
    const svgTagMatch = svg.match(/<svg[^>]*>/i);
    if (svgTagMatch) {
      let needsWidth = !svgTagMatch[0].match(/width=["']/i);
      let needsHeight = !svgTagMatch[0].match(/height=["']/i);
      
      // Если нужны размеры, извлекаем их из viewBox
      if (needsWidth || needsHeight) {
        const viewBoxMatch = svg.match(/viewBox=["']([^"']+)["']/i);
        if (viewBoxMatch) {
          const viewBoxValues = viewBoxMatch[1].split(/\s+/);
          if (viewBoxValues.length >= 4) {
            const width = viewBoxValues[2];
            const height = viewBoxValues[3];
            
            // Добавляем width и height к тегу SVG
            let newSvgTag = svgTagMatch[0];
            const attributes: string[] = [];
            
            if (needsWidth) {
              // Добавляем единицы измерения, если их нет
              const widthValue = width.includes('px') || width.includes('%') || width.includes('em') ? width : `${width}px`;
              attributes.push(`width="${widthValue}"`);
            }
            if (needsHeight) {
              // Добавляем единицы измерения, если их нет
              const heightValue = height.includes('px') || height.includes('%') || height.includes('em') ? height : `${height}px`;
              attributes.push(`height="${heightValue}"`);
            }
            
            if (attributes.length > 0) {
              // Вставляем атрибуты перед закрывающей скобкой тега
              newSvgTag = newSvgTag.replace(/>$/, ` ${attributes.join(" ")}>`);
              // Заменяем старый тег на новый
              svg = svg.replace(/<svg[^>]*>/i, newSvgTag);
            }
          }
        }
      }
    }
    
    return svg;
  }

  // Удаляем существующие defs если есть
  svg = svg.replace(/<defs>[\s\S]*?<\/defs>/gi, "");

  // Извлекаем содержимое между <svg> тегами
  const svgMatch = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  if (!svgMatch) return "";

  const svgInnerContent = svgMatch[1];
  
  // Извлекаем width и height из оригинального SVG
  const svgTagMatch = svg.match(/<svg[^>]*>/i);
  let svgWidth = "";
  let svgHeight = "";
  
  if (svgTagMatch) {
    const widthMatch = svgTagMatch[0].match(/width=["']([^"']+)["']/i);
    const heightMatch = svgTagMatch[0].match(/height=["']([^"']+)["']/i);
    
    if (widthMatch) {
      svgWidth = widthMatch[1];
    }
    if (heightMatch) {
      svgHeight = heightMatch[1];
    }
  }
  
  // Если width и height не найдены, используем размеры из viewBox
  if (!svgWidth || !svgHeight) {
    const viewBoxMatch = svg.match(/viewBox=["']([^"']+)["']/i);
    if (viewBoxMatch) {
      const viewBoxValues = viewBoxMatch[1].split(/\s+/);
      if (viewBoxValues.length >= 4) {
        svgWidth = viewBoxValues[2];
        svgHeight = viewBoxValues[3];
      }
    }
  }
  
  // Если все еще нет размеров, используем значения по умолчанию
  if (!svgWidth) svgWidth = "144";
  if (!svgHeight) svgHeight = "144";

  // Создаем новый SVG с градиентом
  const newSvg = `
    <svg width="${svgWidth}" height="${svgHeight}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" class="transition-opacity duration-300">
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

// Применяем цвета из настроек к SVG со скриптами после выполнения скрипта
const applyColorsToAnimatedSvg = () => {
  if (!iconContainerRef.value) return;
  
  const icon = getIconById(props.iconId);
  if (!icon) return;
  
  // Проверяем, нужно ли применять замену цветов
  const needsColorReplacement = 
    (icon.lightColors && icon.lightColors.length > 0) ||
    (icon.fillColors && icon.fillColors.length > 0);
  
  if (!needsColorReplacement) return;
  
  const svgElement = iconContainerRef.value.querySelector("svg");
  if (!svgElement) return;
  
  // Применяем замену цветов напрямую к элементам в DOM
  // Это не нарушит работу анимации, так как мы не заменяем весь SVG
  
  // Создаем функцию для нормализации цвета для сравнения
  const normalizeColor = (color: string): string => {
    return color.toLowerCase().replace(/#/g, "").trim();
  };
  
  // Применяем замену для lightColors
  if (icon.lightColors && icon.lightColors.length > 0) {
    icon.lightColors.forEach((originalColor) => {
      const normalizedOriginal = normalizeColor(originalColor);
      const lightColor = props.colors.lightColor;
      
      // Находим все элементы с этим цветом
      const allElements = svgElement.querySelectorAll("*");
      allElements.forEach((element) => {
        const el = element as SVGElement;
        const fill = el.getAttribute("fill");
        const stroke = el.getAttribute("stroke");
        
        // Заменяем fill
        if (fill && normalizeColor(fill) === normalizedOriginal) {
          el.setAttribute("fill", lightColor);
        }
        
        // Заменяем stroke
        if (stroke && normalizeColor(stroke) === normalizedOriginal) {
          el.setAttribute("stroke", lightColor);
        }
        
        // Также проверяем RGB формат в атрибутах стиля
        const style = el.getAttribute("style");
        if (style) {
          const rgb = hexToRgb(originalColor);
          if (rgb) {
            const rgbPattern = `rgb\\(\\s*${rgb.r}\\s*,\\s*${rgb.g}\\s*,\\s*${rgb.b}\\s*\\)`;
            if (new RegExp(rgbPattern, "i").test(style)) {
              const lightRgb = hexToRgb(lightColor);
              if (lightRgb) {
                const newStyle = style.replace(
                  new RegExp(rgbPattern, "gi"),
                  `rgb(${lightRgb.r}, ${lightRgb.g}, ${lightRgb.b})`
                );
                el.setAttribute("style", newStyle);
              }
            }
          }
        }
      });
    });
  }
  
  // Применяем замену для fillColors
  if (icon.fillColors && icon.fillColors.length > 0) {
    icon.fillColors.forEach((originalColor) => {
      const normalizedOriginal = normalizeColor(originalColor);
      const fillColor = props.colors.fillColor;
      
      // Находим все элементы с этим цветом
  const allElements = svgElement.querySelectorAll("*");
  allElements.forEach((element) => {
    const el = element as SVGElement;
    const fill = el.getAttribute("fill");
    const stroke = el.getAttribute("stroke");
    
        // Заменяем fill
        if (fill && normalizeColor(fill) === normalizedOriginal) {
          el.setAttribute("fill", fillColor);
        }
        
        // Заменяем stroke
        if (stroke && normalizeColor(stroke) === normalizedOriginal) {
        el.setAttribute("stroke", fillColor);
        }
        
        // Также проверяем RGB формат в атрибутах стиля
        const style = el.getAttribute("style");
        if (style) {
          const rgb = hexToRgb(originalColor);
          if (rgb) {
            const rgbPattern = `rgb\\(\\s*${rgb.r}\\s*,\\s*${rgb.g}\\s*,\\s*${rgb.b}\\s*\\)`;
            if (new RegExp(rgbPattern, "i").test(style)) {
              const fillRgb = hexToRgb(fillColor);
              if (fillRgb) {
                const newStyle = style.replace(
                  new RegExp(rgbPattern, "gi"),
                  `rgb(${fillRgb.r}, ${fillRgb.g}, ${fillRgb.b})`
                );
                el.setAttribute("style", newStyle);
              }
            }
      }
    }
  });
    });
  }
  
  // Также нужно заменить цвета в JSON данных анимации, если они есть
  // Это делается через замену в строковом представлении и обновление через innerHTML
  // Но это может сломать анимацию, поэтому делаем это аккуратно
  // Лучше оставить JSON как есть, так как анимация сама управляет цветами
};

// Вспомогательная функция для конвертации hex в RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) {
    return null;
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
};

// Выполняем скрипты из SVG (для SVGator и других анимированных SVG)
const executeSvgScripts = () => {
  if (!iconContainerRef.value) return;
  
  const svgElement = iconContainerRef.value.querySelector("svg");
  if (!svgElement) return;
  
  const rootId = svgElement.getAttribute("id");
  if (!rootId) {
    console.warn("SVG element has no ID, cannot initialize animation");
    return;
  }
  
  // Находим все скрипты внутри SVG
  const scripts = svgElement.querySelectorAll("script");
  
  // Инициализируем массив для данных анимации ПЕРЕД выполнением скриптов
  if (!(window as any).__SVGATOR_PLAYER__) {
    (window as any).__SVGATOR_PLAYER__ = {};
  }
  if (!Array.isArray((window as any).__SVGATOR_PLAYER__["5c7f360c"])) {
    const existingClass = typeof (window as any).__SVGATOR_PLAYER__["5c7f360c"] === "function" 
      ? (window as any).__SVGATOR_PLAYER__["5c7f360c"] 
      : null;
    (window as any).__SVGATOR_PLAYER__["5c7f360c"] = [];
    if (existingClass) {
      (window as any).__SVGATOR_PLAYER__["5c7f360c_class"] = existingClass;
    }
  }
  
  // Выполняем скрипты естественным образом - создаем новые script элементы
  // Это позволяет браузеру выполнить их в правильном контексте
  scripts.forEach((script) => {
    try {
      const newScript = document.createElement("script");
      let scriptContent = script.textContent || script.innerHTML;
      
      if (scriptContent.includes("<![CDATA[")) {
        const cdataMatch = scriptContent.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
        if (cdataMatch) {
          scriptContent = cdataMatch[1];
        }
      }
      
      newScript.textContent = scriptContent;
      // Выполняем скрипт в глобальном контексте
      document.head.appendChild(newScript);
      document.head.removeChild(newScript);
    } catch (error) {
      console.error("Error executing SVG script:", error);
    }
  });
  
  // Обрабатываем ситуацию, когда первый скрипт заменяет массив на класс
  const savedClass = (window as any).__SVGATOR_PLAYER__?.["5c7f360c_class"];
  const currentData = (window as any).__SVGATOR_PLAYER__?.["5c7f360c"];
  const Ge = savedClass || (typeof currentData === "function" ? currentData : null);
  
  // Если есть массив данных и класс, инициализируем анимацию
  if (Array.isArray(currentData) && currentData.length > 0 && Ge && typeof Ge.init === "function") {
    // Подавляем ошибки от автоматического запуска
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (args[0] && typeof args[0] === 'string' && (
        args[0].includes('n[s] is not a function') ||
        args[0].includes('Cannot read properties of undefined') ||
        args[0].includes('querySelector')
      )) {
        return; // Подавляем ожидаемые ошибки
      }
      originalError.apply(console, args);
    };
    
    try {
      Ge.init();
    } catch (e) {
      // Игнорируем ошибки инициализации
    } finally {
      console.error = originalError;
    }
  }
  
  // Используем простой polling для поиска и запуска player
  const findAndPlayPlayer = (attempt = 1, maxAttempts = 20) => {
    if (attempt > maxAttempts) {
      console.warn("Could not find SVGator player after multiple attempts");
      return;
    }
    
    setTimeout(() => {
      const player = (window as any).__SVGATOR_PLAYER__;
      
      // Метод 1: Проверяем player на SVG элементе
      const svgatorPlayer = (svgElement as any).svgatorPlayer;
      if (svgatorPlayer && typeof svgatorPlayer.play === "function") {
        console.log("Found player on SVG element, starting animation");
        try {
          svgatorPlayer.play();
          return;
        } catch (e) {
          console.warn("Error playing animation:", e);
        }
      }
      
      // Метод 2: Ищем player в глобальном объекте по root ID
      if (rootId && player && player[rootId] && typeof player[rootId].play === "function") {
        console.log(`Found player by root ID: ${rootId}, starting animation`);
        try {
          player[rootId].play();
          return;
        } catch (e) {
          console.warn("Error playing animation:", e);
        }
      }
      
      // Метод 3: Ищем все player объекты в __SVGATOR_PLAYER__
      if (player) {
        const allKeys = Object.keys(player);
        for (const key of allKeys) {
          if (key === "5c7f360c" || key === "5c7f360c_class") continue;
          
          const playerObj = player[key];
          if (playerObj && typeof playerObj === "object") {
            if (typeof playerObj.play === "function") {
              const playerRootId = playerObj.rootId || 
                                  (playerObj.svg?.getAttribute?.("id")) ||
                                  playerObj._rootId ||
                                  (playerObj._svg?.getAttribute?.("id"));
              
              if (playerRootId === rootId) {
                console.log(`Found player with key ${key}, starting animation`);
                try {
                  playerObj.play();
                  return;
                } catch (e) {
                  console.warn("Error playing animation:", e);
                }
              }
            }
            
            if (playerObj.player && typeof playerObj.player.play === "function") {
              console.log(`Found nested player with key ${key}, starting animation`);
              try {
                playerObj.player.play();
                return;
              } catch (e) {
                console.warn("Error playing nested animation:", e);
              }
            }
          }
        }
      }
      
      // Если не нашли, пробуем еще раз
      findAndPlayPlayer(attempt + 1, maxAttempts);
    }, attempt * 200); // Увеличиваем задержку с каждой попыткой
  };
  
  // Начинаем поиск после небольшой задержки
  setTimeout(() => {
    findAndPlayPlayer();
  }, 500);
  
  // Применяем цвета после выполнения скрипта для всех иконок с массивами цветов
  const icon = getIconById(props.iconId);
  const needsColorReplacement = icon && (
    (icon.lightColors && icon.lightColors.length > 0) ||
    (icon.fillColors && icon.fillColors.length > 0)
  );
  
  if (needsColorReplacement) {
    setTimeout(() => {
      console.log("Applying colors to animated SVG");
      applyColorsToAnimatedSvg();
    }, 1000);
  }
  
  // Удаляем скрипты после инициализации
  setTimeout(() => {
    scripts.forEach((script) => {
      try {
        script.remove();
      } catch (e) {
        // Игнорируем ошибки удаления
      }
    });
  }, 2000);
};

// Загружаем иконку при монтировании и при изменении iconId
watch(
  () => props.iconId,
  async () => {
    await loadIcon();
    // Ждем обновления DOM и выполняем скрипты для SVG со скриптами
    nextTick(() => {
      if (iconSvgContent.value && /<script[\s\S]*?<\/script>/i.test(iconSvgContent.value)) {
        // Увеличиваем задержку, чтобы SVG точно был в DOM
        // Используем requestAnimationFrame для гарантии отрисовки
        requestAnimationFrame(() => {
          setTimeout(() => {
            // Проверяем, что SVG элемент существует в DOM
            const svgElement = iconContainerRef.value?.querySelector("svg");
            if (svgElement) {
              console.log("SVG element found in DOM, executing scripts");
              executeSvgScripts();
            } else {
              console.warn("SVG element not found in DOM");
            }
          }, 100);
        });
      }
    });
  },
  { immediate: true }
);

onMounted(() => {
  loadIcon();
});
</script>

<style scoped>
.timer-icon {
  display: inline-block;
}

.timer-icon :deep(svg) {
  display: block;
  max-width: 50vw;
  max-height: 50vw;
  width: auto;
  height: auto;
  min-width: 100px;
  min-height: 100px;
}
</style>
