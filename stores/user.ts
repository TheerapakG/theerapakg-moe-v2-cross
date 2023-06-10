import { FetchResult } from "nuxt/app";
import { defineStore } from "pinia";

type User = FetchResult<`/api/user/${string}/info`, "get">;

export const useUserStore = defineStore("user", () => {
  const users = ref<Record<string, { pending: boolean; data?: User }>>({});

  const getUser = computed(() => {
    return (id: string) => users.value[id]?.data;
  });

  const fetchUser = async (id: string, force?: boolean) => {
    if (users.value[id]) {
      if (users.value[id].pending) return;
      if (users.value[id].data && !force) return;
    }
    users.value[id] = {
      pending: true,
      data: users.value[id]?.data,
    };
    users.value[id] = {
      pending: false,
      data: await $fetch(`/api/user/${id}/info`),
    };
  };

  return {
    users,
    getUser,
    fetchUser,
  };
});
