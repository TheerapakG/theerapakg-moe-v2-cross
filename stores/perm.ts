import { defu } from "defu";
import { defineStore, storeToRefs } from "pinia";

export const usePermStore = defineStore("perm", () => {
  const permStates = ref<{ pending?: Promise<string[]>; value?: string[] }>({});

  const perm = computed(() => {
    return (perm: string) => permStates.value?.value?.includes(perm);
  });

  const _fetchPerms = async () => {
    const { perms } = await $apiFetch(`/api/user/current/perm`);
    permStates.value = { value: perms };
    return perms;
  };

  const _fetchPermsSetPending = async () => {
    const pending = _fetchPerms();
    permStates.value = defu({ pending }, permStates.value);
    return await pending;
  };

  const fetchPerms = async (force?: boolean) => {
    if (permStates.value) {
      if (permStates.value.pending) return await permStates.value.pending;
      if (permStates.value.value !== undefined && !force)
        return permStates.value.value;
    }
    return await _fetchPermsSetPending();
  };

  const userStore = useUserStore();
  const { currentID } = storeToRefs(userStore);
  watch(currentID, async () => {
    await fetchPerms(true);
  });

  return {
    permStates,
    perm,
    fetchPerms,
  };
});
