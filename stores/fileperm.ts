import defu from "defu";
import { FetchResult } from "nuxt/app";
import { defineStore } from "pinia";
import { MaybeRefOrGetter } from "vue";

export type FilePerm = FetchResult<`/api/file/perm`, "get">[number];
export type FilePermString = keyof FilePerm["count"];

const getPartialFilePerm = (id?: string, data?: FilePerm) => {
  return defu({ id }, data) as Partial<FilePerm>;
};

export const useFilePermStore = defineStore("filePerm", () => {
  const filePermCountStates = ref<
    Record<string, { pending?: Promise<FilePerm>; data?: FilePerm }>
  >({});

  const filePerm = computed(() => {
    const state = filePermCountStates.value;
    return (fileId: MaybeRefOrGetter<string | undefined>) =>
      computed(() => {
        const _fileId = toValue(fileId);
        return getPartialFilePerm(
          _fileId,
          _fileId ? state[_fileId]?.data : undefined
        );
      });
  });

  const _fetchFilePermCounts = async (ids: string[]) => {
    if (ids.length === 0) return [];
    try {
      const datas = await $apiFetch(`/api/file/perm`, {
        params: {
          ids: ids.join(","),
        },
      });
      datas.map((data) => {
        filePermCountStates.value[data.id] = { data };
      });
      return datas;
    } catch (error) {
      throw error;
    }
  };

  const _fetchFilePermCountsSetPending = async (ids: string[]) => {
    const allPending = _fetchFilePermCounts(ids);
    ids.map((id, i) => {
      const pending = markRaw(allPending.then((data) => data[i]));
      const value = filePermCountStates.value[id];
      if (value) value.pending = pending;
      else filePermCountStates.value[id] = { pending };
    });
    return await allPending;
  };

  async function fetchFilePermCounts(
    ids: string[],
    force?: boolean,
    ignoreError?: false
  ): Promise<FilePerm[]>;

  async function fetchFilePermCounts(
    ids: string[],
    force?: boolean,
    ignoreError?: boolean
  ): Promise<(FilePerm | undefined)[]>;

  async function fetchFilePermCounts(
    ids: string[],
    force?: boolean,
    ignoreError?: boolean
  ) {
    const states = ids.map((id) => {
      const state = filePermCountStates.value[id];
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
    const pending = _fetchFilePermCountsSetPending(fetchs.map(({ id }) => id));

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
      })
    );
  }

  const fetchFilePermCount = async (
    id: string,
    force?: boolean,
    ignoreError?: boolean
  ) => {
    return (await fetchFilePermCounts([id], force, ignoreError))?.[0];
  };

  const fetchFilePermCountsComputed = async (
    ids: MaybeRefOrGetter<MaybeRefOrGetter<string | undefined>[]>,
    force?: boolean,
    ignoreError?: boolean
  ) => {
    const flatIds = computed(() => useCompact(toValue(ids).map(toValue)));
    const fetcher = async () => {
      await fetchFilePermCounts(flatIds.value, force, ignoreError);
    };
    watch(flatIds, fetcher);
    await fetcher();
    return useRefMap(ids, (id) => filePerm.value(id));
  };

  const fetchFilePermCountComputed = async (
    id: MaybeRefOrGetter<string | undefined>,
    force?: boolean,
    ignoreError?: boolean
  ) => {
    return (await fetchFilePermCountsComputed([id], force, ignoreError))
      .value[0];
  };

  const addFilePermUser = async (
    file: string,
    perm: FilePermString,
    user: string
  ) => {
    await $apiFetch(`/api/file/${file}/perm/${perm}/user/${user}`, {
      method: "PUT",
    });
    return await fetchFilePermCount(file, true);
  };

  const removeFilePermUser = async (
    file: string,
    perm: FilePermString,
    user: string
  ) => {
    await $apiFetch(`/api/file/${file}/perm/${perm}/user/${user}`, {
      method: "DELETE",
    });
    return await fetchFilePermCount(file, true);
  };

  return {
    filePermCountStates,
    filePerm,
    fetchFilePermCounts,
    fetchFilePermCount,
    fetchFilePermCountsComputed,
    fetchFilePermCountComputed,
    addFilePermUser,
    removeFilePermUser,
  };
});
