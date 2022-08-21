<template>
  <div class="relative w-full h-full flex flex-col justify-center">
    <div
      class="absolute w-full h-full"
      @dragenter="dragEnter"
      @dragover="dragOver"
      @dragleave="dragLeave"
      @drop="drop"
    ></div>
    <div v-if="isDragging">
      <div v-if="isSupportedData">
        <slot name="draggingsupported">
          <div class="flex justify-center">
            <DocumentIcon class="stroke-current stroke-2 w-6 h-6 m-1" />
            <div class="m-1">Drop here!</div>
          </div>
        </slot>
      </div>
      <div v-else>
        <slot name="draggingunsupported">
          <div class="flex justify-center">
            <DocumentIcon class="stroke-current stroke-2 w-6 h-6 m-1" />
            <div class="m-1">Data not supported</div>
          </div>
        </slot>
      </div>
    </div>
    <div v-else-if="droppedData">
      <slot name="dropped" :data="droppedData">
        <div v-if="droppedData.items.length > 1">
          <div class="flex justify-center">
            <DocumentIcon class="stroke-current stroke-2 w-6 h-6 m-1" />
            <div class="m-1">Dropped multiple data</div>
          </div>
        </div>
        <div v-else-if="droppedData.items[0].kind === 'string'">
          <div class="flex justify-center">
            <DocumentIcon class="stroke-current stroke-2 w-6 h-6 m-1" />
            <div class="m-1">Dropped a string</div>
          </div>
        </div>
        <div v-else-if="droppedData.items[0].kind === 'file'">
          <div class="flex justify-center">
            <DocumentIcon class="stroke-current stroke-2 w-6 h-6 m-1" />
            <div class="m-1">
              Dropped {{ droppedData.items[0].getAsFile().name }}
            </div>
          </div>
        </div>
      </slot>
    </div>
    <div v-else>
      <slot name="notdragging">
        <div class="flex justify-center">
          <DocumentIcon class="stroke-current stroke-2 w-6 h-6 m-1" />
          <div class="m-1">Drag &amp; drop here!</div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, shallowRef } from "@vue/runtime-core";

import DocumentIcon from "@/components/icons/Document.vue";

export default defineComponent({
  components: {
    DocumentIcon,
  },
  props: {
    checkDraggingData: {
      type: Function as PropType<(data: DataTransfer | null) => boolean>,
      default: () => () => true,
    },
    effect: {
      type: String as PropType<"none" | "copy" | "link" | "move" | undefined>,
      default: () => undefined,
    },
  },
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ["dropped-data"]: (payload: DataTransfer | undefined) => true,
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setup(props, context) {
    const droppedData = shallowRef<DataTransfer | undefined>(undefined);
    const isDragging = ref(false);
    const isSupportedData = ref(false);

    const dragEnter = (event: DragEvent) => {
      event.stopPropagation();
      event.preventDefault();
      isDragging.value = true;
      if (props.checkDraggingData(event.dataTransfer)) {
        isSupportedData.value = true;
        if (event.dataTransfer && props.effect)
          event.dataTransfer.dropEffect = props.effect;
      }
    };

    const dragOver = (event: DragEvent) => {
      event.stopPropagation();
      event.preventDefault();
    };

    const dragLeave = (event: DragEvent) => {
      event.stopPropagation();
      isDragging.value = false;
    };

    const drop = (event: DragEvent) => {
      event.stopPropagation();
      event.preventDefault();
      droppedData.value = event.dataTransfer ?? undefined;
      isDragging.value = false;
      context.emit("dropped-data", droppedData.value);
    };

    return {
      droppedData,
      isDragging,
      isSupportedData,
      dragEnter,
      dragOver,
      dragLeave,
      drop,
    };
  },
});
</script>
