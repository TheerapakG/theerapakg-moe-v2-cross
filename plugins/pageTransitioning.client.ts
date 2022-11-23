import { RouteRecordNormalized } from "vue-router";

type Hook<F extends () => void> = F | F[];

const callHook = <
  Args extends Array<unknown>,
  F extends (...args: Args) => void
>(
  hook: Hook<F> | null | undefined,
  ...args: Args
) => {
  if (!hook) return;
  if (!Array.isArray(hook)) {
    hook(...args);
    return;
  }
  hook.map((h) => {
    h(...args);
  });
};

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
          callHook(pageTransitionBeforeEnter, el);
        },
        onAfterEnter: (el: Element) => {
          console.log("pageTransitionedIn");
          pageStore.transitioningIn = false;
          callHook(pageTransitionAfterEnter, el);
        },
        onBeforeLeave: (el: Element) => {
          console.log("pageTransitioningOut");
          pageStore.transitioningOut = true;
          callHook(pageTransitionBeforeLeave, el);
        },
        onAfterLeave: (el: Element) => {
          console.log("pageTransitionedOut");
          pageStore.transitioningOut = false;
          callHook(pageTransitionAfterLeave, el);
        },
      });
    });
  });
  return nuxtApp;
});
