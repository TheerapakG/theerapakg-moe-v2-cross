<template>
  <div
    ref="containerElement"
    class="container-element relative"
    :style="{ height: `${height}px` }"
  >
    <div
      ref="realElement"
      class="real-element absolute w-full"
      :class="{ 'transition-all duration-300 ease-out': !isSwiping }"
      :style="{ left: `${left * 100}%`, opacity }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { UseSwipeDirection } from "@vueuse/core";

type Props = {
  threshold?: number;
};

const props = withDefaults(defineProps<Props>(), {
  threshold: 50,
});

type Emits = {
  "swipe-start": [e: PointerEvent];
  swipe: [e: PointerEvent];
  "swipe-success": [e: PointerEvent, direction: UseSwipeDirection];
  "swipe-fail": [e: PointerEvent, direction: UseSwipeDirection];
};

const emit = defineEmits<Emits>();

const left = ref(0);
const opacity = ref(1);

const realElement = ref<HTMLElement | null>(null);

const { height } = useElementSize(realElement);

const calculateStyle = () => {
  if (realElement.value?.clientWidth) {
    left.value = -distanceX.value / realElement.value?.clientWidth;
    opacity.value = 1 - Math.abs(left.value);
  }
};

const { distanceX, isSwiping } = usePointerSwipe(realElement, {
  threshold: 1,
  onSwipeStart: (e: PointerEvent) => {
    emit("swipe-start", e);
  },
  onSwipe: (e: PointerEvent) => {
    calculateStyle();
    emit("swipe", e);
  },
  onSwipeEnd(e: PointerEvent, direction: UseSwipeDirection) {
    if (
      realElement.value?.clientWidth &&
      (Math.abs(distanceX.value) / realElement.value?.clientWidth) * 100 >
        props.threshold
    ) {
      left.value = (-distanceX.value / Math.abs(distanceX.value)) * 100;
      opacity.value = 0;
      emit("swipe-success", e, direction);
    } else {
      left.value = 0;
      opacity.value = 1;
      emit("swipe-fail", e, direction);
    }
  },
});
</script>
