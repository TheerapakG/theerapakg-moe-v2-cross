import defu from "defu";
import { FetchResult } from "nuxt/app";
import { defineStore } from "pinia";
import { MaybeRefOrGetter } from "vue";

export type File = FetchResult<`/api/file/info`, "get">[number];

const getPartialFile = (id?: string, data?: File) => {
  return defu({ id }, data) as Partial<File>;
};

export const useFileStore = defineStore("file", () => {
  const fileStates = ref<
    Record<string, { pending?: Promise<File>; data?: File }>
  >({});

  const file = computed(() => {
    const state = fileStates.value;
    return (id: MaybeRefOrGetter<string | undefined>) =>
      computed(() => {
        const _id = toValue(id);
        return getPartialFile(_id, _id ? state[_id]?.data : undefined);
      });
  });

  const _fetchFiles = async (ids: string[]) => {
    if (ids.length === 0) return [];
    try {
      const datas = await $apiFetch(`/api/file/info`, {
        params: {
          ids: ids.join(","),
        },
      });
      datas.map((data) => {
        fileStates.value[data.id] = { data };
      });
      return datas;
    } catch (error) {
      throw error;
    }
  };

  const _fetchFilesSetPending = async (ids: string[]) => {
    const allPending = _fetchFiles(ids);
    ids.map((id, i) => {
      const pending = markRaw(allPending.then((data) => data[i]));
      const value = fileStates.value[id];
      if (value) value.pending = pending;
      else fileStates.value[id] = { pending };
    });
    return await allPending;
  };

  async function fetchFiles(
    ids: string[],
    force?: boolean,
    ignoreError?: false
  ): Promise<File[]>;

  async function fetchFiles(
    ids: string[],
    force?: boolean,
    ignoreError?: boolean
  ): Promise<(File | undefined)[]>;

  async function fetchFiles(
    ids: string[],
    force?: boolean,
    ignoreError?: boolean
  ) {
    const states = ids.map((id) => {
      const state = fileStates.value[id];
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
    const pending = _fetchFilesSetPending(fetchs.map(({ id }) => id));

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

  const fetchFile = async (
    id: string,
    force?: boolean,
    ignoreError?: boolean
  ) => {
    return (await fetchFiles([id], force, ignoreError))?.[0];
  };

  const fetchFilesComputed = async (
    ids: MaybeRefOrGetter<MaybeRefOrGetter<string | undefined>[]>,
    force?: boolean,
    ignoreError?: boolean
  ) => {
    const flatIds = computed(() => useCompact(toValue(ids).map(toValue)));
    const fetcher = async () => {
      await fetchFiles(flatIds.value, force, ignoreError);
    };
    watch(flatIds, fetcher);
    await fetcher();
    return useRefMap(ids, (id) => file.value(id));
  };

  const fetchFileComputed = async (
    id: MaybeRefOrGetter<string | undefined>,
    force?: boolean,
    ignoreError?: boolean
  ) => {
    return (await fetchFilesComputed([id], force, ignoreError)).value[0];
  };

  const uploadFile = async (name: string, content: string) => {
    const { id } = await $apiFetch("/api/file/upload", {
      method: "POST",
      body: {
        file: name,
        content,
      },
    });
    return {
      id,
      file: await fetchFile(id, true),
    };
  };

  const renameFile = async (id: string, name: string) => {
    await $apiFetch(`/api/file/${id}/rename`, {
      method: "PUT",
      params: { name },
    });
    return await fetchFile(id, true);
  };

  const editFile = async (id: string, content: string) => {
    await $apiFetch(`/api/file/${id}/edit`, {
      method: "PUT",
      body: { content },
    });
    return await fetchFile(id, true);
  };

  const deleteFile = async (id: string) => {
    await $apiFetch(`/api/file/${id}`, {
      method: "DELETE",
    });
    await fetchFile(id, true, true);
  };

  return {
    fileStates,
    file,
    fetchFiles,
    fetchFile,
    fetchFilesComputed,
    fetchFileComputed,
    uploadFile,
    renameFile,
    editFile,
    deleteFile,
  };
});
