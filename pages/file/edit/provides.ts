import type { InjectionKey, Ref } from "vue";

export const mountedKey = Symbol() as InjectionKey<Ref<boolean>>;
