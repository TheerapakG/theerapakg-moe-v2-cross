import type { Pinia } from "pinia";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("page:start", () => {
    const routeStore = useRouteStore(nuxtApp.$pinia as Pinia);
    routeStore.navigating = true;
  });
  nuxtApp.hook("page:finish", () => {
    const routeStore = useRouteStore(nuxtApp.$pinia as Pinia);
    routeStore.navigating = false;
  });
});
