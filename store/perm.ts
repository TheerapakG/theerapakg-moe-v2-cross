import { defineStore, storeToRefs } from "pinia";
import { Ref } from "vue";

export const usePermStore = defineStore("perm", () => {
  const userStore = useUserStore();
  const { current } = storeToRefs(userStore);
  const perms: { [perm: string]: Ref<boolean> } = {};

  const usePerm = async (perm: string) => {
    if (!perms[perm]) {
      const config = useRuntimeConfig();
      const { value } = await $fetch(
        `/api/user/current/perm/${encodeURIComponent(perm)}`,
        {
          headers: useRequestHeaders(["cookie"]),
          baseURL: config.public?.apiBaseURL ?? "/",
        }
      );
      perms[perm] = ref(value);
    }
    return perms[perm];
  };

  watch(current, () => {
    for (const perm in perms) delete perms[perm];
  });

  return {
    perms,
    usePerm,
  };
});
