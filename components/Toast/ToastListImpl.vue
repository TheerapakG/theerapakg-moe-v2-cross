<template>
  <div class="relative">
    <div
      ref="toastListElement"
      class="relative -left-full w-[300%] max-h-full overflow-y-scroll hide-scrollbars"
    >
      <TransitionGroup
        name="list"
        tag="div"
        class="flex flex-col gap-y-4"
        :class="{ 'py-8': Object.keys(toasts).length !== 0 }"
      >
        <ToastCard
          v-for="(_, id) in toasts"
          :key="id"
          :toast-store-id="toastStoreId"
          :toast-id="(id as string)"
          class="relative left-1/3 w-1/3 pointer-events-auto"
        />
      </TransitionGroup>
    </div>
    <div
      v-if="!toastListElementArrivedState.top && !hideFade"
      class="absolute w-full h-8 top-0 bg-gradient-to-t from-transparent to-white dark:to-black"
    />
    <div
      v-if="!toastListElementArrivedState.bottom && !hideFade"
      class="absolute w-full h-8 bottom-0 bg-gradient-to-b from-transparent to-white dark:to-black"
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

const toastListElement = ref<HTMLElement | null>(null);

const toastStore = useToastStore(toastStoreId.value);
const { toasts } = storeToRefs(toastStore);

const { arrivedState: toastListElementArrivedState } =
  useScroll(toastListElement);
const { height: toastListElementHeight } = useElementSize(toastListElement);

const hideFade = computed(
  () =>
    toastListElementHeight.value === 0 ||
    toastListElementHeight.value === toastListElement.value.scrollHeight
);
</script>

<style scoped>
.list-leave-active {
  @apply h-0 -my-2;
}
</style>
