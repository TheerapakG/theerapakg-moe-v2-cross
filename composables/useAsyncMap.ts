import { MaybeRefOrGetter } from "vue";

export const useAsyncMap = async <T, U>(
  arr: MaybeRefOrGetter<MaybeRefOrGetter<T>[] | null | undefined>,
  f: (arg: MaybeRefOrGetter<T>) => Promise<Ref<U>>
) => {
  const result = shallowRef<Ref<U>[]>([]);

  const refreshArr = async () => {
    result.value = await Promise.all(toValue(arr)?.map((arg) => f(arg)) ?? []);
  };

  if (isRef(arr)) watch(arr, refreshArr);
  await refreshArr();
  return result;
};
