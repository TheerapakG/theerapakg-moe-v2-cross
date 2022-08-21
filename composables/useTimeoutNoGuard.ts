import { noop, Stoppable, TimeoutOptions } from "@vueuse/shared";
import { ComputedRef } from "vue";

export function useTimeoutNoGuard(
  interval?: number,
  options?: TimeoutOptions<false>
): ComputedRef<boolean>;
export function useTimeoutNoGuard(
  interval: number,
  options: TimeoutOptions<true>
): { ready: ComputedRef<boolean> } & Stoppable;

export function useTimeoutNoGuard<Controls extends boolean>(
  interval = 1000,
  options: TimeoutOptions<Controls> = {}
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
