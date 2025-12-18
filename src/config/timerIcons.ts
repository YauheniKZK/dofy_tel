export interface TimerIcon {
  id: string; // Уникальный ID иконки
  name: string; // Название для отображения
  path: string; // Содержимое SVG файла (raw string) или URL для загрузки
  active: boolean; // Флаг активности - показывать ли иконку при создании/редактировании
  category?: string; // Опциональная категория для группировки
}

// Коллекция иконок таймера
// Чтобы добавить новую иконку:
// 1. Положите SVG файл в src/assets/icons/timer-icons/
// 2. Добавьте запись в этот массив с active: true/false
// Импортируем SVG файлы
import coffeeIcon from "@/assets/icons/timer-icons/coffee.svg?raw";
import coffee1Icon from "@/assets/icons/timer-icons/coffee1.svg?raw";

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
  },
  {
    id: "coffee1",
    name: "Кофе 1",
    path: coffee1Icon, // Используем raw импорт для получения содержимого SVG
    active: true,
    category: "Еда и напитки",
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
