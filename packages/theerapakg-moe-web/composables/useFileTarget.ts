import MimeType from "whatwg-mimetype";
import type { RouteLocationRaw } from "vue-router";

const defaultMime = {
  type: "text",
  subtype: "plain",
  parameters: undefined,
};

export const useFileTarget = async (
  file: MaybeRefOrGetter<string>,
  mode: MaybeRefOrGetter<"view" | "edit">,
) => {
  const fileStore = useFileStore();

  const fileInfo = await fileStore.fetchFileComputed(file);

  const mimeType = computed(() => {
    if (!fileInfo.value.mime) return defaultMime;
    try {
      return new MimeType(fileInfo.value.mime);
    } catch {
      return defaultMime;
    }
  });

  return computed<RouteLocationRaw>(() => {
    const mime = mimeType.value;
    const query = mime.parameters
      ? Object.fromEntries(mime.parameters.entries())
      : undefined;

    return {
      path: `/file/${toValue(mode)}/mime/${mime.type}/${mime.subtype}/${toValue(
        file,
      )}`,
      query,
    };
  });
};
