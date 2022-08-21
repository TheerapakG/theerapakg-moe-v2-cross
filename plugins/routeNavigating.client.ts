export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("page:start", () => {
    console.log("navigating");
    const routeStore = useRouteStore(nuxtApp.$pinia);
    routeStore.navigating = true;
  });
  nuxtApp.hook("page:finish", () => {
    console.log("navigated");
    const routeStore = useRouteStore(nuxtApp.$pinia);
    routeStore.navigating = false;
  });
  return nuxtApp;
});
