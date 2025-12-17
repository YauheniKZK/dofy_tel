import Home from "@/screens/home/Home.vue";
import Index from "@/screens/Index.vue";
import Main from "@/layout/Main.vue";
import Market from "@/screens/market/Market.vue";
import Stats from "@/screens/stats/Stats.vue";
import Management from "@/screens/management/Management.vue";
import Profile from "@/screens/profile/Profile.vue";
import Timer from "@/screens/timer/Timer.vue";
import TimerRun from "@/screens/timer/TimerRun.vue";
import WorkRestTimer from "@/screens/work-rest-timer/WorkRestTimer.vue";

export default () => {
  return [
    {
      path: "/",
      name: "main",
      redirect: { name: "index" },
      component: Main,
      children: [
        {
          path: "/index",
          name: "index",
          meta: {
            requiresAuth: true,
          },
          redirect: { name: "home" },
          component: Index,
          children: [
            {
              path: "/home",
              name: "home",
              meta: {
                requiresAuth: true,
                transition: "",
              },
              component: Home,
            },
            {
              path: "/market",
              name: "market",
              meta: {
                requiresAuth: true,
                transition: "",
              },
              component: Market,
            },
            {
              path: "/stats",
              name: "stats",
              meta: {
                requiresAuth: true,
                transition: "",
              },
              component: Stats,
            },
            {
              path: "/management",
              name: "management",
              meta: {
                requiresAuth: true,
                transition: "",
              },
              component: Management,
            },
            {
              path: "/profile",
              name: "profile",
              meta: {
                requiresAuth: true,
                transition: "",
              },
              component: Profile,
            },
            {
              path: "/timer",
              name: "timer",
              meta: {
                requiresAuth: true,
                transition: "",
              },
              component: Timer,
            },
            {
              path: "/timer/run/:id",
              name: "timer-run",
              meta: {
                requiresAuth: true,
                transition: "",
              },
              component: TimerRun,
            },
            {
              path: "/work-rest-timer",
              name: "work-rest-timer",
              meta: {
                requiresAuth: true,
                transition: "",
              },
              component: WorkRestTimer,
            },
          ],
        },
      ],
    },
  ];
};
