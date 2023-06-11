import { defu } from "defu";
import { defineStore, storeToRefs } from "pinia";

export const usePermStore = defineStore("perm", () => {
  const permStates = ref<
    Record<string, { pending?: Promise<boolean>; value?: boolean }>
  >({});

  const perm = computed(() => {
    return (perm: string) => permStates.value[perm]?.value;
  });

  const _fetchPerm = async (perm: string) => {
    const { value } = await $apiFetch(`/api/user/current/perm/${perm}`);
    permStates.value[perm] = { value };
    return value;
  };

  const _fetchPermSetPending = async (perm: string) => {
    const pending = _fetchPerm(perm);
    permStates.value[perm] = defu({ pending }, permStates.value[perm]);
    return await pending;
  };

  const fetchPerm = async (perm: string, force?: boolean) => {
    if (permStates.value[perm]) {
      if (permStates.value[perm].pending)
        return await permStates.value[perm].pending;
      if (permStates.value[perm].value !== undefined && !force)
        return permStates.value[perm].value;
    }
    return await _fetchPermSetPending(perm);
  };

  const userStore = useUserStore();
  const { currentID } = storeToRefs(userStore);
  watch(currentID, async () => {
    await Promise.all(
      useKeys(permStates.value).map(async (perm) => await fetchPerm(perm, true))
    );
  });

  return {
    permStates,
    perm,
    fetchPerm,
  };
});
