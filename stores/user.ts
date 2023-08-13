import defu from "defu";
import { FetchResult } from "nuxt/app";
import { defineStore } from "pinia";
import { MaybeRefOrGetter } from "vue";

export type User = FetchResult<`/api/user/info`, "get">[number];

const getPartialUser = (id?: string, data?: User) => {
  return defu({ id }, data) as Partial<User>;
};

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
    return (id: MaybeRefOrGetter<string | undefined>) =>
      computed(() => {
        const _id = toValue(id);
        return getPartialUser(_id, _id ? state[_id]?.data : undefined);
      });
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

  const _fetchUsers = async (ids: string[]) => {
    if (ids.length === 0) return [];
    try {
      const datas = await $apiFetch(`/api/user/info`, {
        params: {
          ids: ids.join(","),
        },
      });
      datas.map((data) => {
        userStates.value[data.id] = { data };
      });
      return datas;
    } catch (error) {
      throw error;
    }
  };

  const _fetchUsersSetPending = async (ids: string[]) => {
    const allPending = _fetchUsers(ids);
    ids.map((id, i) => {
      const pending = markRaw(allPending.then((data) => data[i]));
      const value = userStates.value[id];
      if (value) value.pending = pending;
      else userStates.value[id] = { pending };
    });
    return await allPending;
  };

  async function fetchUsers(ids: string[], force?: boolean) {
    const states = ids.map((id) => {
      const state = userStates.value[id];
      if (state?.pending)
        return {
          id,
          promise: state.pending,
        };
      if (state?.data && !force)
        return { id, promise: Promise.resolve(state.data) };
      return { id };
    });

    const fetchs = states
      .filter(({ promise }) => !promise)
      .map(({ id }, i) => {
        return { id, index: i };
      });
    const indicesMap = useKeyBy(fetchs, "id");
    const pending = _fetchUsersSetPending(fetchs.map(({ id }) => id));

    return await Promise.all(
      states.map(({ id, promise }) => {
        if (promise) return promise;
        const index = indicesMap[id];
        return pending.then((data) => data[index.index]);
      }),
    );
  }

  const fetchUser = async (id: string, force?: boolean) => {
    return (await fetchUsers([id], force))?.[0];
  };

  const fetchUsersComputed = async (
    ids: MaybeRefOrGetter<MaybeRefOrGetter<string | undefined>[]>,
    force?: boolean,
  ) => {
    const flatIds = computed(() => useCompact(toValue(ids).map(toValue)));
    const fetcher = async () => {
      await fetchUsers(flatIds.value, force);
    };
    watch(flatIds, fetcher);
    await fetcher();
    return useRefMap(ids, (id) => user.value(id));
  };

  const fetchUserComputed = async (
    id: MaybeRefOrGetter<string | undefined>,
    force?: boolean,
  ) => {
    return (await fetchUsersComputed([id], force)).value[0];
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
    fetchUsers,
    fetchUser,
    fetchUsersComputed,
    fetchUserComputed,
    fetchCurrent,
    fetchCurrentComputed,
  };
});
