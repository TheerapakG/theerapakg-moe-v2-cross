<template>
  <div
    v-hover="hoverHandler"
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
    <Transition name="fade">
      <div
        v-if="controlVisible"
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
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Handler, addV } from "@vueuse/gesture";

type Props = {
  fileId: string;
};

defineProps<Props>();

const factor = ref(100);
const factorStr = computed(() => `${factor.value}%`);

const offset = ref([0, 0]);
const displayOffset = ref([0, 0]);
const displayOffsetStr = computed(() =>
  displayOffset.value.map((i) => `${i}px`).join(", ")
);

const drag = ref(false);

const dragHandler: Handler<"drag"> = ({ movement, dragging }) => {
  drag.value = dragging;
  displayOffset.value = addV(
    offset.value,
    movement.map((i) => (i * 100) / factor.value)
  );
  if (!dragging) {
    offset.value = displayOffset.value;
  }
};

const lastHover = ref(Date.now());
const controlVisible = ref(false);

const hoverHandler: Handler<"hover"> = ({ hovering }) => {
  if (hovering) {
    lastHover.value = Date.now();
    controlVisible.value = true;
    return;
  }
  setTimeout(() => {
    if (lastHover.value + 1000 < Date.now()) {
      controlVisible.value = false;
    }
  }, 1000);
};
</script>

<style scoped>
.image {
  transform: scale(v-bind(factorStr)) translate(v-bind(displayOffsetStr));
}
</style>
