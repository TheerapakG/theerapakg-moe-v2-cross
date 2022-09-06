import { defineStore } from "pinia";

export const usePageStore = defineStore("page", () => {
  const pageContainerDom = shallowRef<HTMLDivElement>(null);
  const transitioningIn = ref(false);
  const transitioningOut = ref(false);
  const transitioning = computed(
    () => transitioningIn.value || transitioningOut.value
  );

  return {
    pageContainerDom,
    transitioningIn,
    transitioningOut,
    transitioning,
  };
});
