import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import store from "@/store/index.ts";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/VHome.vue"),
  },
  {
    name: "profile",
    path: "/user/:username",
    component: () => import("@/views/VProfile.vue"),
  },
  {
    name: "petition",
    path: "/petition/:slug",
    component: () => import("@/views/VPetition.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  console.log("start routing to " + to.path);
  const isAuthenticated = store.getters.isAuthenticated;
  console.log("isAuthenticated: " + isAuthenticated);

  const isGoToAuthPage = to.path == "/register" || to.path == "/login";
  const isGoToPageNotRequireLogin =
    to.path == "/" || to.path.startsWith("/petition");
  if (isGoToAuthPage) {
    //check if the user is already logged in
    if (isAuthenticated) next("/");
    else next();
  } else if (isGoToPageNotRequireLogin) next();
  //prevent the user from accessing page that needs to be authenticated
  else if (!isAuthenticated) next("/");
  else next();
});

export default router;
