import { defineStore } from "pinia";

export const usePageStore = defineStore("page", () => {
  const pageContainerDom = shallowRef<HTMLDivElement | null>(null);

  return {
    pageContainerDom,
  };
});
