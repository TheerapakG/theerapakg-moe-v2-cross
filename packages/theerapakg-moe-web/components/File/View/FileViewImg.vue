<script setup lang="ts">
import { type Handler, addV } from "@vueuse/gesture";

type Props = {
  fileId: string;
};

defineProps<Props>();

const wrapper = ref<HTMLElement>();
const control = ref<HTMLElement>();

const factor = ref(100);
const factorStr = computed(() => `${factor.value}%`);

const offset = ref([0, 0]);
const displayOffset = ref([0, 0]);
const displayOffsetStr = computed(() =>
  displayOffset.value.map((i) => `${i}px`).join(", "),
);

const drag = ref(false);

const dragHandler: Handler<"drag"> = ({ movement, dragging }) => {
  drag.value = dragging;
  displayOffset.value = addV(
    offset.value,
    movement.map((i) => (i * 100) / factor.value),
  );
  if (!dragging) {
    offset.value = displayOffset.value;
  }
};

const controlVisible = useAutoHideVisible(wrapper, control);
</script>

<template>
  <div
    ref="wrapper"
    class="relative flex flex-col place-content-start place-items-center"
  >
    <div
      v-drag="dragHandler"
      class="relative flex w-full flex-grow place-content-center place-items-center overflow-hidden"
      :class="{ 'cursor-grabbing': drag, 'hover:cursor-grab': !drag }"
      :drag-options="{ useTouch: true }"
    >
      <img
        class="image absolute"
        :src="`/api/file/${fileId}/download`"
        draggable="false"
        role="img"
      />
    </div>
    <TransitionFade>
      <div
        v-if="controlVisible"
        ref="control"
        class="absolute bottom-4 flex place-content-center place-items-center gap-2 rounded-lg border-2 border-gray-500 bg-white px-4 py-2 dark:border-gray-400 dark:bg-black"
      >
        <div class="min-w-[4rem] font-bold">{{ factor }}%</div>
        <div class="w-8">
          <UButton
            class="h-8"
            block
            icon="i-heroicons-magnifying-glass-plus"
            :ui="{ rounded: 'rounded-full' }"
            @click="factor += 10"
          />
        </div>
        <div class="w-8">
          <UButton
            class="h-8"
            block
            icon="i-heroicons-magnifying-glass-minus"
            :ui="{ rounded: 'rounded-full' }"
            @click="factor -= 10"
          />
        </div>
      </div>
    </TransitionFade>
  </div>
</template>

<style scoped>
.image {
  transform: scale(v-bind(factorStr)) translate(v-bind(displayOffsetStr));
}
</style>
