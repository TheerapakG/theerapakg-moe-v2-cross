<template>
  <div
    class="relative flex h-full w-full flex-col place-content-center place-items-center"
  >
    <div
      class="absolute h-full w-full"
      @click="onClick"
      @dragenter="dragEnter"
      @dragover="dragOver"
      @dragleave="dragLeave"
      @drop="drop"
    ></div>
    <div v-if="isDragging">
      <div v-if="isSupportedData">
        <slot name="draggingsupported">
          <div class="flex justify-center">
            <UIcon class="m-1 h-6 w-6" name="i-heroicons-document" />
            <div class="m-1">Drop here!</div>
          </div>
        </slot>
      </div>
      <div v-else>
        <slot name="draggingunsupported">
          <div class="flex justify-center">
            <UIcon class="m-1 h-6 w-6" name="i-heroicons-document" />
            <div class="m-1">Data not supported</div>
          </div>
        </slot>
      </div>
    </div>
    <div v-else-if="droppedData">
      <slot name="dropped" :data="droppedData">
        <div v-if="droppedData.length > 1">
          <div class="flex justify-center">
            <UIcon class="m-1 h-6 w-6" name="i-heroicons-document" />
            <div class="m-1">Dropped multiple data</div>
          </div>
        </div>
        <div v-else-if="droppedData[0].kind === 'string'">
          <div class="flex justify-center">
            <UIcon class="m-1 h-6 w-6" name="i-heroicons-document" />
            <div class="m-1">Dropped a string</div>
          </div>
        </div>
        <div v-else-if="droppedData[0].kind === 'file'">
          <div class="flex justify-center">
            <UIcon class="m-1 h-6 w-6" name="i-heroicons-document" />
            <div class="m-1">Dropped {{ droppedData[0].file.name }}</div>
          </div>
        </div>
      </slot>
    </div>
    <div v-else>
      <slot name="notdragging">
        <div class="flex justify-center">
          <UIcon class="m-1 h-6 w-6" name="i-heroicons-document" />
          <div class="m-1">Drag &amp; drop here!</div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  checkDraggingData?: (
    data:
      | (
          | {
              kind: "string";
              type: string;
              cb: (cb: (s: string) => void) => void;
            }
          | {
              kind: "file";
              type: string;
              file: File;
            }
        )[]
      | null
  ) => boolean;
  file?: boolean;
  effect?: "none" | "copy" | "link" | "move";
};

const props = withDefaults(defineProps<Props>(), {
  checkDraggingData: () => true,
  file: true,
  effect: undefined,
});

type Emits = {
  "dropped-data": [
    payload:
      | (
          | {
              kind: "string";
              type: string;
              string: string;
            }
          | {
              kind: "file";
              type: string;
              file: File;
            }
        )[]
      | undefined
  ];
};

const emit = defineEmits<Emits>();

const droppedData = ref<
  | (
      | {
          kind: "string";
          type: string;
          string: string;
        }
      | {
          kind: "file";
          type: string;
          file: File;
        }
    )[]
  | undefined
>(undefined);
const isDragging = ref(false);
const isSupportedData = ref(false);

const dragEnter = (event: DragEvent) => {
  event.stopPropagation();
  event.preventDefault();
  isDragging.value = true;
  if (
    props.checkDraggingData(
      useMap(event.dataTransfer?.items, (dataItem) => {
        const { kind, type } = dataItem;
        if (kind === "string") {
          return {
            kind: "string",
            type,
            cb: dataItem.getAsString,
          };
        } else {
          return {
            kind: "file",
            type,
            file: dataItem.getAsFile() as File,
          };
        }
      })
    )
  ) {
    isSupportedData.value = true;
    if (event.dataTransfer && props.effect) {
      event.dataTransfer.dropEffect = props.effect;
    }
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

let unwatchNewDroppedData: (() => void) | undefined = undefined;

const drop = (event: DragEvent) => {
  event.stopPropagation();
  event.preventDefault();
  isDragging.value = false;
  if (isSupportedData.value) {
    const newDroppedData = useMap(event.dataTransfer?.items, (dataItem) => {
      const { kind, type } = dataItem;
      if (kind === "string") {
        const ret = ref<{
          kind: "string";
          type: string;
          string: string;
        } | null>(null);
        dataItem.getAsString((s) => {
          ret.value = {
            kind: "string",
            type,
            string: s,
          };
        });
        return ret;
      } else {
        return {
          kind: "file",
          type,
          file: shallowReactive(dataItem.getAsFile() as File),
        };
      }
    });
    const refs = newDroppedData.filter((r) => isRef(r)) as Ref<{
      kind: "string";
      type: string;
      string: string;
    }>[];
    const setDroppedData = () => {
      if (refs.every((r) => r.value)) {
        droppedData.value = newDroppedData.map((r) =>
          isRef(r) ? r.value : r
        ) as typeof droppedData.value;
        unwatchNewDroppedData?.();
        unwatchNewDroppedData = undefined;
        emit("dropped-data", droppedData.value);
      }
    };
    unwatchNewDroppedData = watch(refs, setDroppedData);
    setDroppedData();
  }
};

watch(droppedData, () => console.log(droppedData.value));

const onClick = () => {
  if (props.file) {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.addEventListener("change", (event) => {
      droppedData.value = useMap(
        (event.target as HTMLInputElement).files,
        (f) => {
          return {
            kind: "file",
            type: f.type,
            file: shallowReactive(f),
          };
        }
      ) as unknown as typeof droppedData.value;
      unwatchNewDroppedData?.();
      unwatchNewDroppedData = undefined;
      emit("dropped-data", droppedData.value);
    });
    input.click();
    input.remove();
  }
};
</script>
