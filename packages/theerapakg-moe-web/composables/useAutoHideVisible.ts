import type { MaybeElement } from "@vueuse/core";
import { useMove } from "@vueuse/gesture";

export const useAutoHideVisible = (
  wrapper: MaybeRefOrGetter<MaybeElement>,
  autohide: MaybeRefOrGetter<MaybeElement>,
) => {
  const _wrapper = toRef(wrapper);
  const _autohide = toRef(autohide);

  const moveTimeout = ref<NodeJS.Timeout>();
  const pointerMoving = ref(false);

  const updateMoveTimeout = () => {
    pointerMoving.value = true;

    if (moveTimeout.value) {
      clearTimeout(moveTimeout.value);
      moveTimeout.value = undefined;
    }
    moveTimeout.value = setTimeout(() => {
      pointerMoving.value = false;
    }, 3000);
  };

  const { pressed, sourceType } = useMousePressed({ target: _wrapper });
  watch([pressed, sourceType], () => {
    if (pressed.value && sourceType.value === "touch") updateMoveTimeout();
  });

  useMove(
    ({ moving }) => {
      if (moving) updateMoveTimeout();
    },
    { domTarget: _wrapper },
  );

  const { isOutside: isOutsideControl } = useMouseInElement(_autohide);

  const controlVisible = computed(
    () => pointerMoving.value || !isOutsideControl.value,
  );

  return controlVisible;
};
