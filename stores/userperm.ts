import { defineStore, storeToRefs } from "pinia";

export const useUserPermStore = defineStore("userPerm", () => {
  const permStates = ref<{
    pending?: Promise<string[]>;
    value?: string[];
  }>({});

  const _getChecker = (perms?: string[]) => (perm: string) =>
    perms?.includes(perm);

  const perm = computed(() => _getChecker(permStates.value.value));

  const _fetchPerms = async () => {
    const { perms } = await $apiFetch(`/api/user/current/perm`);
    permStates.value = { value: perms };
    return perms;
  };

  const _fetchPermsSetPending = async () => {
    const pending = markRaw(_fetchPerms());
    permStates.value.pending = pending;
    return await pending;
  };

  const fetchPerms = async (force?: boolean) => {
    if (permStates.value.pending)
      return _getChecker(await permStates.value.pending);
    if (permStates.value.value !== undefined && !force)
      return _getChecker(permStates.value.value);
    return _getChecker(await _fetchPermsSetPending());
  };

  const fetchPermsComputed = async (force?: boolean) => {
    await fetchPerms(force);
    return perm;
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
    fetchPermsComputed,
  };
});
