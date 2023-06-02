import { FetchResult } from "nuxt/app";
import type { InjectionKey, Ref } from "vue";

export const mountedKey = Symbol() as InjectionKey<Ref<boolean>>;
export const fileInfoKey = Symbol() as InjectionKey<
  Ref<FetchResult<`/api/file/${string}/info`, "get"> | null>
>;
