import { InjectionKey, Ref } from "vue";

export const status = Symbol() as InjectionKey<Ref<Set<string>>>;
