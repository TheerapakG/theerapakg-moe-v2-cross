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
    const config = useRuntimeConfig();
    const { value } = await $fetch(`/api/user/current`, {
      headers: useRequestHeaders(["cookie"]),
      baseURL: config.public?.apiBaseURL ?? "/",
    });
    current.value = { ...value };
    if (!users[current.value.id]) {
      users[current.value.id] = ref({ ...value });
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
      const config = useRuntimeConfig();
      users[id] = ref({ id });
      const { value } = await $fetch(`/api/user/${id}/info`, {
        baseURL: config.public?.apiBaseURL ?? "/",
      });
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
