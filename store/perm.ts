import { defineStore, storeToRefs } from "pinia";
import { Ref } from "vue";

export const usePermStore = defineStore("perm", () => {
  const userStore = useUserStore();
  const { current } = storeToRefs(userStore);
  const perms: { [perm: string]: Ref<boolean> } = {};

  const usePerm = async (perm: string) => {
    if (!perms[perm]) {
      const { value } = await $apiFetch(
        `/api/user/current/perm/${encodeURIComponent(perm)}`
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
