# Dofy Telegram Client

Веб-версия приложения Dofy на базе Vue 3, TypeScript, Naive UI, Pinia и Vue Router.

## Технологии

- **Vite** - сборщик проекта
- **Vue 3** - фреймворк
- **TypeScript** - типизация
- **Naive UI** - UI библиотека
- **Pinia** - управление состоянием
- **Vue Router** - маршрутизация

## Установка

```bash
npm install
```

## Запуск

```bash
npm run dev
```

## Сборка

```bash
npm run build
```

## Структура проекта

```
src/
├── components/          # Компоненты
│   ├── AddEditTimerModal.vue
│   ├── AddTaskModal.vue
│   ├── TimerActiveView.vue
│   └── WorkRestTimerActiveView.vue
├── router/             # Роутинг
│   └── index.ts
├── stores/             # Pinia stores
│   ├── settings.ts
│   ├── tasks.ts
│   └── timers.ts
├── types/              # TypeScript типы
│   └── models.ts
├── views/              # Страницы
│   ├── ContentView.vue
│   ├── ManagementView.vue
│   ├── MyTasksView.vue
│   ├── SettingsView.vue
│   ├── TimersView.vue
│   └── WorkRestTimerView.vue
├── App.vue
└── main.ts
```

## Функциональность

- **Таймер работа-отдых** - интервальный таймер с настройками циклов
- **Обычный таймер** - создание и управление таймерами
- **Задачи** - управление задачами с приоритетами и подзадачами
- **Настройки** - настройки приложения

## Хранение данных

Все данные хранятся в `localStorage` браузера.
