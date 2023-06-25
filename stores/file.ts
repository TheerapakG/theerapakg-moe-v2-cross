import { FetchResult } from "nuxt/app";
import { defineStore } from "pinia";
import { MaybeRefOrGetter } from "vue";

type File = FetchResult<`/api/file/${string}/info`, "get">;

export const useFileStore = defineStore("file", () => {
  const fileStates = ref<
    Record<string, { pending?: Promise<File>; data?: File }>
  >({});

  const file = computed(() => {
    const state = fileStates.value;
    return (id: MaybeRefOrGetter<string>) =>
      computed(() => state[toValue(id)]?.data);
  });

  const _fetchFile = async (id: string) => {
    try {
      const data = await $apiFetch(`/api/file/${id}/info`);
      fileStates.value[id] = { data };
      return data;
    } catch (error) {
      delete fileStates.value[id];
      throw error;
    }
  };

  const _fetchFileSetPending = async (id: string) => {
    const pending = markRaw(_fetchFile(id));
    const value = fileStates.value[id];
    if (value) value.pending = pending;
    else fileStates.value[id] = { pending };
    return await pending;
  };

  async function fetchFile(
    id: string,
    force?: boolean,
    ignoreError?: false
  ): Promise<File>;

  async function fetchFile(
    id: string,
    force?: boolean,
    ignoreError?: boolean
  ): Promise<File | undefined>;

  async function fetchFile(id: string, force?: boolean, ignoreError?: boolean) {
    const state = fileStates.value[id];
    if (state) {
      if (state.pending) {
        try {
          return await state.pending;
        } catch (error) {
          if (!ignoreError) throw error;
        }
      }
      if (state.data && !force) return state.data;
    }
    try {
      return await _fetchFileSetPending(id);
    } catch (error) {
      if (!ignoreError) throw error;
    }
  }

  const fetchFileComputed = async (
    id: MaybeRefOrGetter<string>,
    force?: boolean,
    ignoreError?: boolean
  ) => {
    const fetcher = async () => {
      await fetchFile(toValue(id), force, ignoreError);
    };
    if (isRef(id)) watch(id, fetcher);
    await fetcher();
    return computed(() => file.value(id).value);
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
    fetchFile,
    fetchFileComputed,
    uploadFile,
    renameFile,
    editFile,
    deleteFile,
  };
});
