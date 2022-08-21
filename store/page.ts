import { defineStore } from "pinia";

export const usePageStore = defineStore("page", () => {
  const transitioningIn = ref(false);
  const transitioningOut = ref(false);
  const transitioning = computed(
    () => transitioningIn.value || transitioningOut.value
  );

  return {
    transitioningIn,
    transitioningOut,
    transitioning,
  };
});
