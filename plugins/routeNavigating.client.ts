export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("page:start", () => {
    const routeStore = useRouteStore(nuxtApp.$pinia);
    routeStore.navigating = true;
  });
  nuxtApp.hook("page:finish", () => {
    const routeStore = useRouteStore(nuxtApp.$pinia);
    routeStore.navigating = false;
  });
});
