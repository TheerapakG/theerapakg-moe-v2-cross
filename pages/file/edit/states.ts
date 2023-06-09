import type { FetchResult } from "nuxt/app";

export const useMountedState = () => useState(() => false);
export const useFileInfoState = () =>
  useState<
    (FetchResult<`/api/file/${string}/info`, "get"> & { id: string }) | null
  >(() => null);
