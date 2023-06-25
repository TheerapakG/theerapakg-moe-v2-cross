import {
  isClient,
  MaybeRefOrGetter,
  Stoppable,
  UseTimeoutFnOptions,
} from "@vueuse/shared";

export const useTimeoutFnNoGuard = (
  cb: (...args: unknown[]) => unknown,
  interval: MaybeRefOrGetter<number>,
  options: UseTimeoutFnOptions = {}
): Stoppable => {
  const { immediate = true } = options;

  const isPending = ref(false);

  let timer: number | null = null;

  const clear = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const stop = () => {
    isPending.value = false;
    clear();
  };

  const start = (...args: unknown[]) => {
    clear();
    isPending.value = true;
    timer = setTimeout(() => {
      isPending.value = false;
      timer = null;
      cb(...args);
    }, toValue(interval)) as unknown as number;
  };

  if (immediate) {
    isPending.value = true;
    if (isClient) start();
  }

  return {
    isPending,
    start,
    stop,
  };
};
