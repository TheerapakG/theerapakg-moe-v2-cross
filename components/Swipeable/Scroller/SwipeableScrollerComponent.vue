<template>
  <div
    ref="containerElement"
    class="hide-scrollbars -ml-[100%] flex snap-x snap-mandatory overflow-x-scroll"
  >
    <div
      class="pointer-events-none h-px w-1/3 flex-none"
      :class="{ 'snap-center snap-always': !virtualScrolling }"
    />
    <div
      class="pointer-events-none h-px w-1/3 flex-none"
      :class="{ 'snap-center snap-always': !virtualScrolling }"
    />
    <div
      ref="realElement"
      class="real-element-opacity w-1/3 flex-none"
      :class="{ 'snap-center snap-always': !virtualScrolling }"
    >
      <slot />
    </div>
    <div
      class="pointer-events-none h-px w-1/3 flex-none"
      :class="{ 'snap-center snap-always': !virtualScrolling }"
    />
    <div
      class="pointer-events-none h-px w-1/3 flex-none"
      :class="{ 'snap-center snap-always': !virtualScrolling }"
    />
  </div>
</template>

<script setup lang="ts">
import { WatchStopHandle } from "vue";

interface Emits {
  (event: "swiped"): void;
}

const emit = defineEmits<Emits>();

const containerElement = ref<HTMLElement | null>(null);
const realElement = ref<HTMLElement | null>(null);

const { x: containerElementPos, isScrolling: containerElementIsScrolling } =
  useScroll(containerElement);
const { width: containerElementWidth } = useElementSize(containerElement);
const { pressed: containerPressed, sourceType: containerPressedSourceType } =
  useMousePressed({
    target: containerElement,
  });
const { x: containerMousePos } = useMouseInElement(containerElement);

const realElementOpacity = computed(
  () =>
    1 -
    Math.abs((3 * containerElementPos.value) / containerElementWidth.value - 1)
);

const ready = ref(false);

const resetScrollPos = () => {
  if (!containerElementIsScrolling.value && containerElementWidth.value !== 0) {
    ready.value = false;
    containerElement.value?.scrollTo({
      left: containerElementWidth.value / 3,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      behavior: "instant",
    });
    const unwatch = watch(containerElementIsScrolling, () => {
      if (!containerElementIsScrolling.value) {
        unwatch();
        ready.value = true;
      }
    });
  }
};
resetScrollPos();
watch(containerElementWidth, resetScrollPos);

let mouseDragUnwatch: WatchStopHandle | null = null;
const virtualScrolling = ref(false);

watch(containerPressed, () => {
  if (containerPressed.value && containerPressedSourceType.value === "mouse") {
    const currentScrollPos = containerElementPos.value;
    const currentMousePos = containerMousePos.value;
    virtualScrolling.value = true;
    mouseDragUnwatch = watch(containerMousePos, () => {
      containerElement.value?.scrollTo({
        left: currentScrollPos - containerMousePos.value + currentMousePos,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        behavior: "instant",
      });
    });
  } else {
    mouseDragUnwatch?.();
    mouseDragUnwatch = null;
    virtualScrolling.value = false;
  }
});

const successSwiped = computed(
  () =>
    ready.value &&
    !(containerElementIsScrolling.value || virtualScrolling.value) &&
    containerElementWidth.value > 0 &&
    (containerElementPos.value < (0.5 * containerElementWidth.value) / 3 ||
      containerElementPos.value > (1.5 * containerElementWidth.value) / 3)
);

watch(successSwiped, () => {
  if (successSwiped.value) {
    emit("swiped");
  }
});
</script>

<style scoped>
.real-element-opacity {
  opacity: v-bind(realElementOpacity);
}
</style>
