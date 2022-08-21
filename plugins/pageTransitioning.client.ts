import { RouteRecordNormalized } from "vue-router";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:mounted", () => {
    const pageStore = usePageStore();

    const routes = useRouter().getRoutes();
    useMap(routes, (route: RouteRecordNormalized) => {
      if (!route.meta.pageTransition) {
        route.meta.pageTransition = { name: "page", mode: "out-in" };
      }
      const pageTransitionBeforeEnter =
        route.meta.pageTransition === true
          ? null
          : route.meta.pageTransition.onBeforeEnter;
      const pageTransitionAfterEnter =
        route.meta.pageTransition === true
          ? null
          : route.meta.pageTransition.onAfterEnter;
      const pageTransitionBeforeLeave =
        route.meta.pageTransition === true
          ? null
          : route.meta.pageTransition.onBeforeLeave;
      const pageTransitionAfterLeave =
        route.meta.pageTransition === true
          ? null
          : route.meta.pageTransition.onAfterLeave;
      route.meta.pageTransition = useAssign(route.meta.pageTransition, {
        onBeforeEnter: (el: Element) => {
          console.log("pageTransitioningIn");
          pageStore.transitioningIn = true;
          pageTransitionBeforeEnter?.(el);
        },
        onAfterEnter: (el: Element) => {
          console.log("pageTransitionedIn");
          pageStore.transitioningIn = false;
          pageTransitionAfterEnter?.(el);
        },
        onBeforeLeave: (el: Element) => {
          console.log("pageTransitioningOut");
          pageStore.transitioningOut = true;
          pageTransitionBeforeLeave?.(el);
        },
        onAfterLeave: (el: Element) => {
          console.log("pageTransitionedOut");
          pageStore.transitioningOut = false;
          pageTransitionAfterLeave?.(el);
        },
      });
    });
  });
  return nuxtApp;
});
