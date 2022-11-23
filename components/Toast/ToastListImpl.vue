<template>
  <div ref="containerElement" class="relative">
    <div
      ref="toastListElement"
      class="hide-scrollbars relative -left-full max-h-full w-[300%] overflow-y-scroll"
      :class="{ 'pointer-events-auto': !outsideContainer }"
    >
      <TransitionGroup
        name="list-slide"
        tag="div"
        class="flex flex-col gap-y-4"
        :class="{ 'py-8': Object.keys(toasts).length !== 0 }"
      >
        <ToastCard
          v-for="(_, id) in toasts"
          :key="id"
          :toast-store-id="toastStoreId"
          :toast-id="(id as string)"
          class="pointer-events-auto relative left-1/3 w-1/3"
        />
      </TransitionGroup>
    </div>
    <div
      v-if="!toastListElementArrivedState.top && !hideFade"
      class="absolute top-0 h-8 w-full bg-gradient-to-t from-transparent to-white dark:to-black"
    />
    <div
      v-if="!toastListElementArrivedState.bottom && !hideFade"
      class="absolute bottom-0 h-8 w-full bg-gradient-to-b from-transparent to-white dark:to-black"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";

interface Props {
  toastStoreId: string;
}

const props = defineProps<Props>();
const { toastStoreId } = toRefs(props);

const containerElement = ref<HTMLElement | null>(null);
const toastListElement = ref<HTMLElement | null>(null);

const toastStore = useToastStore(toastStoreId.value);
const { toasts } = storeToRefs(toastStore);

const { isOutside: outsideContainer } = useMouseInElement(containerElement, {
  handleOutside: false,
});
const { arrivedState: toastListElementArrivedState } =
  useScroll(toastListElement);
const { height: toastListElementHeight } = useElementSize(toastListElement);

const hideFade = computed(
  () =>
    toastListElementHeight.value === 0 ||
    toastListElementHeight.value === toastListElement.value?.scrollHeight
);
</script>

<style scoped>
.list-slide-leave-active {
  @apply -my-2 h-0;
}
</style>
