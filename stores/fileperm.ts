import { hash } from "ohash";
import { defineStore } from "pinia";
import { MaybeRefOrGetter } from "vue";

export const useFilePermStore = defineStore("filePerm", () => {
  const filePermCountStates = ref<
    Record<string, { pending?: Promise<number>; count?: number }>
  >({});

  const count = computed(() => {
    const state = filePermCountStates.value;
    return (
      fileId: MaybeRefOrGetter<string>,
      perm: MaybeRefOrGetter<"view" | "edit">
    ) => computed(() => state[hash([toValue(fileId), toValue(perm)])]?.count);
  });

  const _fetchFilePermCount = async (fileId: string, perm: "view" | "edit") => {
    const { count } = await $apiFetch(`/api/file/${fileId}/perm/${perm}/count`);
    const h = hash([fileId, perm]);
    filePermCountStates.value[h] = { count };
    return count;
  };

  const _fetchFilePermCountSetPending = async (
    fileId: string,
    perm: "view" | "edit"
  ) => {
    const pending = markRaw(_fetchFilePermCount(fileId, perm));
    const h = hash([fileId, perm]);
    const value = filePermCountStates.value[h];
    if (value) value.pending = pending;
    else filePermCountStates.value[h] = { pending };
    return await pending;
  };

  const fetchFilePermCount = async (
    fileId: string,
    perm: "view" | "edit",
    force?: boolean
  ) => {
    const h = hash([fileId, perm]);
    const state = filePermCountStates.value[h];
    if (state) {
      if (state.pending) return await state.pending;
      if (state.count !== undefined && !force) return state.count;
    }
    return await _fetchFilePermCountSetPending(fileId, perm);
  };

  const fetchFilePermCountComputed = async (
    fileId: MaybeRefOrGetter<string>,
    perm: MaybeRefOrGetter<"view" | "edit">,
    force?: boolean
  ) => {
    const fetcher = async () => {
      await fetchFilePermCount(toValue(fileId), toValue(perm), force);
    };
    watch([fileId, perm].filter(isRef), fetcher);
    await fetcher();
    return computed(() => count.value(fileId, perm).value);
  };

  return {
    filePermCountStates,
    count,
    fetchFilePermCount,
    fetchFilePermCountComputed,
  };
});
