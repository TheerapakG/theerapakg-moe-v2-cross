import FloatingVue from "floating-vue";

export default defineNuxtPlugin(() => {
  FloatingVue.options.themes = {
    ...FloatingVue.options.themes,
    "context-menu": {
      $extend: "dropdown",
    },
  };

  return;
});
