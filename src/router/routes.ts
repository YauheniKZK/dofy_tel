import Home from "@/screens/home/Home.vue";
import Index from "@/screens/Index.vue";
import Main from "@/layout/Main.vue";
import Market from "@/screens/market/Market.vue";
import Stats from "@/screens/stats/Stats.vue";
import Management from "@/screens/management/Management.vue";
import Profile from "@/screens/profile/Profile.vue";

export default () => {
  return [
    {
      path: "/",
      name: "main",
      redirect: { path: "/index" },
      component: Main,
      children: [
        {
          path: "/index",
          name: "index",
          meta: {
            requiresAuth: true,
          },
          redirect: { path: "/home" },
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
          ],
        },
      ],
    },
  ];
};
