import { createApp } from "vue";
import "./assets/css/style.css";
import App from "./App.vue";
import router from "@/router";
import { createPinia } from "pinia";
import i18n from "./i18n";
import WebApp from "@twa-dev/sdk";

// Инициализация Telegram WebApp через SDK
try {
  WebApp.ready();
  WebApp.expand();
  WebApp.themeParams.section_header_text_color = "#FFFFFF";
  WebApp.themeParams.secondary_bg_color = "#888888";
  WebApp.themeParams.text_color = "#FFFFFF";
  WebApp.setHeaderColor("#35374B");
} catch (e) {
  console.warn("WebApp SDK not available:", e);
}

// Создаем и монтируем приложение
const app = createApp(App);

app.use(router);
app.use(createPinia());
app.use(i18n);

// Монтируем приложение
app.mount("#app");
