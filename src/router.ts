import Vue from "vue";
import Router from "vue-router";
import Users from "./views/Users.vue";
import Funnels from "./views/Funnels.vue";
import Projects from "./views/Projects.vue";

import authService from './services/auth';

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    { path: "/",           name: "home",        component: Users },
    { path: "/users",      name: "users",       component: () =>        import(/* webpackChunkName: "about" */ "./views/Users.vue")    },
    { path: "/project/:project/funnels",    name: "funnels",     component: () =>        import(/* webpackChunkName: "about" */ "./views/Funnels.vue")    },
    { path: "/projects",   name: "projects",    component: () =>        import(/* webpackChunkName: "about" */ "./views/Projects.vue")    },
    { path: "/profile",    name: "profile",     component: () =>        import(/* webpackChunkName: "about" */ "./views/Profile.vue")    },
    { path: "/auth",       name: "auth",        component: () =>        import(/* webpackChunkName: "about" */ "./views/Auth.vue")    },
    { path: "/user/:id",   name: "user",        component: () =>        import("./views/User.vue")    },
  ]
});

router.beforeEach((to, from, next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/auth'];
  const authRequired = !publicPages.includes(to.path);
  const alreadyAuth = publicPages.includes(to.path);
  const loggedIn = authService.isLoggedIn();

  if (authRequired && !loggedIn) {
    return next('/auth');
  }

  if (alreadyAuth && loggedIn) {
    return next('/');
  }

  next();
})

export default router;