import { noop, Stoppable, UseTimeoutOptions } from "@vueuse/shared";
import { ComputedRef } from "vue";

export function useTimeoutNoGuard(
  interval?: number,
  options?: UseTimeoutOptions<false>
): ComputedRef<boolean>;
export function useTimeoutNoGuard(
  interval: number,
  options: UseTimeoutOptions<true>
): { ready: ComputedRef<boolean> } & Stoppable;

export function useTimeoutNoGuard<Controls extends boolean>(
  interval = 1000,
  options: UseTimeoutOptions<Controls> = {}
) {
  const { controls = false } = options;

  const timeoutControls = useTimeoutFnNoGuard(noop, interval, options);

  const ready = computed(() => !timeoutControls.isPending.value);

  if (controls) {
    return {
      ready,
      ...timeoutControls,
    };
  } else {
    return ready;
  }
}
