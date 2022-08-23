import { defineStore } from "pinia";

export const useSessionStore = defineStore("session", () => {
  const id = ref(useCookie("session_id").value);

  watch(useCookie("session_id"), (newId) => {
    id.value = newId;
  });

  return {
    id,
  };
});
