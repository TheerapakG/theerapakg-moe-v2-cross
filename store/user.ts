import { defineStore } from "pinia";
import { Ref } from "vue";

export interface User {
  id: string;
  name?: string;
}

export const useUserStore = defineStore("user", () => {
  const current: Ref<User> = ref();
  const users: { [id: string]: Ref<User> } = {};

  const refreshCurrent = async () => {
    const value = await $apiFetch(`/api/user/current`);
    current.value = { ...value };
    if (!users[current.value.id]) {
      users[current.value.id] = ref(value);
    } else {
      users[current.value.id].value = { ...value };
    }
  };

  const useCurrent = async () => {
    if (!current.value) await refreshCurrent();
    return current;
  };

  const useUser = async (id: string) => {
    if (!users[id]) {
      users[id] = ref({ id });
      const value = await $apiFetch(`/api/user/${id}/info`);
      users[id].value = {
        id,
        ...value,
      };
    }
    return users[id];
  };

  return {
    current,
    refreshCurrent,
    useCurrent,
    useUser,
  };
});
