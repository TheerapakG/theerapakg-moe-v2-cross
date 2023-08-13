import defu from "defu";
import { FetchResult } from "nuxt/app";
import { defineStore } from "pinia";
import { MaybeRefOrGetter } from "vue";

export type Container = FetchResult<`/api/container/info`, "get">[number];

const getPartialContainer = (id?: string, data?: Container) => {
  return defu({ id }, data) as Partial<Container>;
};

export const useContainerStore = defineStore("container", () => {
  const containerStates = ref<
    Record<string, { pending?: Promise<Container>; data?: Container }>
  >({});

  const container = computed(() => {
    const state = containerStates.value;
    return (id: MaybeRefOrGetter<string | undefined>) =>
      computed(() => {
        const _id = toValue(id);
        return getPartialContainer(_id, _id ? state[_id]?.data : undefined);
      });
  });

  const _fetchContainers = async (ids: string[]) => {
    if (ids.length === 0) return [];
    try {
      const datas = await $apiFetch(`/api/container/info`, {
        params: {
          ids: ids.join(","),
        },
      });
      datas.map((data) => {
        containerStates.value[data.id] = { data };
      });
      return datas;
    } catch (error) {
      throw error;
    }
  };

  const _fetchContainersSetPending = async (ids: string[]) => {
    const allPending = _fetchContainers(ids);
    ids.map((id, i) => {
      const pending = markRaw(allPending.then((data) => data[i]));
      const value = containerStates.value[id];
      if (value) value.pending = pending;
      else containerStates.value[id] = { pending };
    });
    return await allPending;
  };

  async function fetchContainers(
    ids: string[],
    force?: boolean,
    ignoreError?: false,
  ): Promise<Container[]>;

  async function fetchContainers(
    ids: string[],
    force?: boolean,
    ignoreError?: boolean,
  ): Promise<(Container | undefined)[]>;

  async function fetchContainers(
    ids: string[],
    force?: boolean,
    ignoreError?: boolean,
  ) {
    const states = ids.map((id) => {
      const state = containerStates.value[id];
      if (state?.pending)
        return {
          id,
          promise: state.pending.catch((error) => {
            if (ignoreError) return undefined;
            throw error;
          }),
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
    const pending = _fetchContainersSetPending(fetchs.map(({ id }) => id));

    return await Promise.all(
      states.map(({ id, promise }) => {
        if (promise) return promise;
        const index = indicesMap[id];
        return pending
          .then((data) => data[index.index])
          .catch((error) => {
            if (ignoreError) return undefined;
            throw error;
          });
      }),
    );
  }

  const fetchContainer = async (
    id: string,
    force?: boolean,
    ignoreError?: boolean,
  ) => {
    return (await fetchContainers([id], force, ignoreError))?.[0];
  };

  const fetchContainersComputed = async (
    ids: MaybeRefOrGetter<MaybeRefOrGetter<string | undefined>[]>,
    force?: boolean,
    ignoreError?: boolean,
  ) => {
    const flatIds = computed(() => useCompact(toValue(ids).map(toValue)));
    const fetcher = async () => {
      await fetchContainers(flatIds.value, force, ignoreError);
    };
    watch(flatIds, fetcher);
    await fetcher();
    return useRefMap(ids, (id) => container.value(id));
  };

  const fetchContainerComputed = async (
    id: MaybeRefOrGetter<string | undefined>,
    force?: boolean,
    ignoreError?: boolean,
  ) => {
    return (await fetchContainersComputed([id], force, ignoreError)).value[0];
  };

  const pauseContainer = async (id: string) => {
    await $apiFetch(`/api/file/${id}/pause`, {
      method: "POST",
    });
    return await fetchContainer(id, true);
  };

  const unpauseContainer = async (id: string) => {
    await $apiFetch(`/api/file/${id}/unpause`, {
      method: "POST",
    });
    return await fetchContainer(id, true);
  };

  const killContainer = async (id: string) => {
    await $apiFetch(`/api/file/${id}/kill`, {
      method: "POST",
    });
    return await fetchContainer(id, true);
  };

  const deleteContainer = async (id: string) => {
    await $apiFetch(`/api/file/${id}`, {
      method: "DELETE",
    });
    return await fetchContainer(id, true);
  };

  return {
    containerStates,
    container,
    fetchContainers,
    fetchContainer,
    fetchContainersComputed,
    fetchContainerComputed,
    pauseContainer,
    unpauseContainer,
    killContainer,
    deleteContainer,
  };
});
