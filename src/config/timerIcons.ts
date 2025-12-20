export interface TimerIcon {
  id: string; // Уникальный ID иконки
  name: string; // Название для отображения
  path: string; // Содержимое SVG файла (raw string) или URL для загрузки
  active: boolean; // Флаг активности - показывать ли иконку при создании/редактировании
  category?: string; // Опциональная категория для группировки
  lightColors?: string[]; // Массив цветов, которые будут заменяться на lightColor из настроек таймера
  fillColors?: string[]; // Массив цветов, которые будут заменяться на fillColor из настроек таймера
}

// Коллекция иконок таймера
// Чтобы добавить новую иконку:
// 1. Положите SVG файл в src/assets/icons/timer-icons/
// 2. Добавьте запись в этот массив с active: true/false
// Импортируем SVG файлы
import coffeeIcon from "@/assets/icons/timer-icons/coffee.svg?raw";
import coffee1Icon from "@/assets/icons/timer-icons/coffee1.svg?raw";
import SVGator from "@/assets/icons/timer-icons/SVGator.svg?raw";
import BasicAnimations from "@/assets/icons/timer-icons/BasicAnimations.svg?raw";

export const TIMER_ICONS: TimerIcon[] = [
  {
    id: "none",
    name: "Без иконки",
    path: "", // Пустой путь для опции "без иконки"
    active: true,
    category: "Системные",
  },
  {
    id: "coffee",
    name: "Кофе",
    path: coffeeIcon, // Используем raw импорт для получения содержимого SVG
    active: true,
    category: "Еда и напитки",
    // Массивы цветов не указаны - замена цветов не применяется
  },
  {
    id: "coffee1",
    name: "Кофе 1",
    path: coffee1Icon, // Используем raw импорт для получения содержимого SVG
    active: true,
    category: "Еда и напитки",
    // Массивы цветов не указаны - замена цветов не применяется
  },
  {
    id: "SVGator",
    name: "SVGator",
    path: SVGator, // Используем raw импорт для получения содержимого SVG
    active: true,
    category: "Другое",
    // Массивы цветов не указаны - замена цветов не применяется
  },
  {
    id: "BasicAnimations",
    name: "BasicAnimations",
    path: BasicAnimations, // Используем raw импорт для получения содержимого SVG
    active: true,
    category: "Другое",
    lightColors: ["#166bff", "#112346"], // Цвета, которые будут заменяться на lightColor
    fillColors: ["#fff"], // Цвета, которые будут заменяться на fillColor
  },
  // Добавьте здесь другие иконки по мере необходимости
  // Пример:
  // import workoutIcon from '@/assets/icons/timer-icons/workout.svg?raw';
  // {
  //   id: 'workout',
  //   name: 'Тренировка',
  //   path: workoutIcon,
  //   active: true,
  //   category: 'Спорт',
  // },
];

// Получить активные иконки
export const getActiveIcons = (): TimerIcon[] => {
  return TIMER_ICONS.filter((icon) => icon.active);
};

// Получить иконку по ID
export const getIconById = (id: string): TimerIcon | undefined => {
  return TIMER_ICONS.find((icon) => icon.id === id);
};

// Получить иконку по умолчанию (первая активная)
export const getDefaultIcon = (): TimerIcon | undefined => {
  const activeIcons = getActiveIcons();
  return activeIcons.length > 0 ? activeIcons[0] : undefined;
};

/**
 * Конвертирует hex цвет в RGB объект
 */
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

/**
 * Заменяет цвета в SVG содержимом на основе настроек таймера
 * @param svgContent - Исходное содержимое SVG
 * @param icon - Объект иконки с массивами цветов для замены
 * @param lightColor - Цвет для замены lightColors
 * @param fillColor - Цвет для замены fillColors
 * @returns SVG содержимое с замененными цветами
 */
export const replaceIconColors = (
  svgContent: string,
  icon: TimerIcon,
  lightColor: string,
  fillColor: string
): string => {
  if (!svgContent || !icon || !lightColor || !fillColor) return svgContent;

  let result = svgContent;

  // Заменяем цвета из lightColors на lightColor
  if (icon.lightColors && icon.lightColors.length > 0) {
    icon.lightColors.forEach((originalColor) => {
      const normalizedColor = originalColor.toLowerCase().replace("#", "");
      const rgb = hexToRgb(originalColor);

      // Заменяем hex формат (#166bff, "#166bff", '#166bff')
      result = result.replace(
        new RegExp(`#${normalizedColor}(?![0-9a-fA-F])`, "g"),
        lightColor
      );
      result = result.replace(
        new RegExp(`"#${normalizedColor}"`, "g"),
        `"${lightColor}"`
      );
      result = result.replace(
        new RegExp(`'#${normalizedColor}'`, "g"),
        `'${lightColor}'`
      );

      // Заменяем RGB формат, если есть
      if (rgb) {
        const rgbPattern = `rgb\\(\\s*${rgb.r}\\s*,\\s*${rgb.g}\\s*,\\s*${rgb.b}\\s*\\)`;
        const lightRgb = hexToRgb(lightColor);
        if (lightRgb) {
          result = result.replace(
            new RegExp(rgbPattern, "gi"),
            `rgb(${lightRgb.r}, ${lightRgb.g}, ${lightRgb.b})`
          );
        }

        // Заменяем RGB в JSON формате (для анимаций): {"r":255,"g":255,"b":255} или {"t":"c","v":{"r":255,"g":255,"b":255,"a":1}}
        // Паттерн для простого формата
        const jsonRgbPattern = `\\{\\s*"r"\\s*:\\s*${rgb.r}\\s*,\\s*"g"\\s*:\\s*${rgb.g}\\s*,\\s*"b"\\s*:\\s*${rgb.b}`;
        // Паттерн для вложенного формата с "t":"c" и "v"
        const jsonNestedPattern = `"v"\\s*:\\s*\\{\\s*"r"\\s*:\\s*${rgb.r}\\s*,\\s*"g"\\s*:\\s*${rgb.g}\\s*,\\s*"b"\\s*:\\s*${rgb.b}`;

        if (lightRgb) {
          // Заменяем простой формат
          result = result.replace(
            new RegExp(jsonRgbPattern, "gi"),
            `{"r":${lightRgb.r},"g":${lightRgb.g},"b":${lightRgb.b}`
          );
          // Заменяем вложенный формат
          result = result.replace(
            new RegExp(jsonNestedPattern, "gi"),
            `"v":{"r":${lightRgb.r},"g":${lightRgb.g},"b":${lightRgb.b}`
          );
        }
      }
    });
  }

  // Заменяем цвета из fillColors на fillColor
  if (icon.fillColors && icon.fillColors.length > 0) {
    icon.fillColors.forEach((originalColor) => {
      const normalizedColor = originalColor.toLowerCase().replace("#", "");
      const rgb = hexToRgb(originalColor);

      // Заменяем hex формат
      result = result.replace(
        new RegExp(`#${normalizedColor}(?![0-9a-fA-F])`, "g"),
        fillColor
      );
      result = result.replace(
        new RegExp(`"#${normalizedColor}"`, "g"),
        `"${fillColor}"`
      );
      result = result.replace(
        new RegExp(`'#${normalizedColor}'`, "g"),
        `'${fillColor}'`
      );

      // Заменяем RGB формат, если есть
      if (rgb) {
        const rgbPattern = `rgb\\(\\s*${rgb.r}\\s*,\\s*${rgb.g}\\s*,\\s*${rgb.b}\\s*\\)`;
        const fillRgb = hexToRgb(fillColor);
        if (fillRgb) {
          result = result.replace(
            new RegExp(rgbPattern, "gi"),
            `rgb(${fillRgb.r}, ${fillRgb.g}, ${fillRgb.b})`
          );
        }

        // Заменяем RGB в JSON формате (для анимаций)
        // Паттерн для простого формата
        const jsonRgbPattern = `\\{\\s*"r"\\s*:\\s*${rgb.r}\\s*,\\s*"g"\\s*:\\s*${rgb.g}\\s*,\\s*"b"\\s*:\\s*${rgb.b}`;
        // Паттерн для вложенного формата с "t":"c" и "v"
        const jsonNestedPattern = `"v"\\s*:\\s*\\{\\s*"r"\\s*:\\s*${rgb.r}\\s*,\\s*"g"\\s*:\\s*${rgb.g}\\s*,\\s*"b"\\s*:\\s*${rgb.b}`;

        if (fillRgb) {
          // Заменяем простой формат
          result = result.replace(
            new RegExp(jsonRgbPattern, "gi"),
            `{"r":${fillRgb.r},"g":${fillRgb.g},"b":${fillRgb.b}`
          );
          // Заменяем вложенный формат
          result = result.replace(
            new RegExp(jsonNestedPattern, "gi"),
            `"v":{"r":${fillRgb.r},"g":${fillRgb.g},"b":${fillRgb.b}`
          );
        }
      }
    });
  }

  return result;
};
