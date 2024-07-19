import { GesturePlugin } from "@vueuse/gesture";

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.use(GesturePlugin);
});
