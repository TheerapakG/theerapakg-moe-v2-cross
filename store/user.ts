import { defineStore } from "pinia";
import { Ref } from "vue";

export interface User {
  id: string;
  name?: string;
}

export const useUserStore = defineStore("user", () => {
  const users: { [id: string]: Ref<User> } = {};

  const useUser = async (id: string) => {
    if (!users[id]) {
      users[id] = ref({ id });
      const { value } = await $fetch(`/api/user/${id}/info`);
      users[id].value = {
        id,
        ...value,
      };
    }
    return users[id];
  };

  return {
    useUser,
  };
});
