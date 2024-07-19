import PortalVue from "portal-vue";

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.use(PortalVue);
});
