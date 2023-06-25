import { FetchResult } from "nuxt/app";
import { defineStore } from "pinia";
import { MaybeRefOrGetter } from "vue";

type User = FetchResult<`/api/user/${string}/info`, "get">;

export const useUserStore = defineStore("user", () => {
  const userStates = ref<
    Record<string, { pending?: Promise<User>; data?: User }>
  >({});
  const currentState = ref<{
    pending?: Promise<string>;
    id?: string;
  }>({});

  const user = computed(() => {
    const state = userStates.value;
    return (id: MaybeRefOrGetter<string>) =>
      computed(() => state[toValue(id)]?.data);
  });

  const currentID = computed(() => currentState.value.id);
  const current = computed(() => {
    const id = currentID.value;
    if (!id) return undefined;
    return {
      id,
      data: user.value(id).value,
    };
  });

  const _fetchUser = async (id: string) => {
    const data = await $apiFetch(`/api/user/${id}/info`);
    userStates.value[id] = { data };
    return data;
  };

  const _fetchUserSetPending = async (id: string) => {
    const pending = markRaw(_fetchUser(id));
    const value = userStates.value[id];
    if (value) value.pending = pending;
    else userStates.value[id] = { pending };
    return await pending;
  };

  const fetchUser = async (id: string, force?: boolean) => {
    const state = userStates.value[id];
    if (state) {
      if (state.pending) return await state.pending;
      if (state.data && !force) return state.data;
    }
    return await _fetchUserSetPending(id);
  };

  const fetchUserComputed = async (
    id: MaybeRefOrGetter<string>,
    force?: boolean
  ) => {
    const fetcher = async () => {
      await fetchUser(toValue(id), force);
    };
    if (isRef(id)) watch(id, fetcher);
    await fetcher();
    return computed(() => user.value(id).value);
  };

  const _fetchCurrent = async () => {
    const { id } = await $apiFetch(`/api/user/current`);
    currentState.value = { id };
    return id;
  };

  const _fetchCurrentSetPending = async () => {
    const pending = markRaw(_fetchCurrent());
    currentState.value.pending = pending;
    return await pending;
  };

  const fetchCurrent = async (force?: boolean) => {
    if (currentState.value.pending) {
      const id = await currentState.value.pending;
      return {
        id,
        data: await fetchUser(id),
      };
    }
    if (currentState.value.id && !force) {
      return {
        id: currentState.value.id,
        data: await fetchUser(currentState.value.id),
      };
    }
    const id = await _fetchCurrentSetPending();
    return {
      id,
      data: await fetchUser(id, force),
    };
  };

  const fetchCurrentComputed = async (force?: boolean) => {
    await fetchCurrent(force);
    return current;
  };

  return {
    userStates,
    currentState,
    user,
    currentID,
    current,
    fetchUser,
    fetchUserComputed,
    fetchCurrent,
    fetchCurrentComputed,
  };
});
