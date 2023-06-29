<template>
  <div
    class="relative flex h-full w-full flex-col place-content-center place-items-center"
  >
    <div v-if="isOverDropZone">
      <slot name="over">
        <div class="flex justify-center">
          <UIcon class="m-1 h-6 w-6" name="i-heroicons-document" />
          <div class="m-1">Drop here!</div>
        </div>
      </slot>
    </div>
    <div v-else-if="files.length > 0">
      <slot name="dropped" :files="files">
        <div v-if="files.length > 1">
          <div class="flex justify-center">
            <UIcon class="m-1 h-6 w-6" name="i-heroicons-document" />
            <div class="m-1">Dropped multiple files</div>
          </div>
        </div>
        <div v-else>
          <div class="flex justify-center">
            <UIcon class="m-1 h-6 w-6" name="i-heroicons-document" />
            <div class="m-1">Dropped {{ files[0].name }}</div>
          </div>
        </div>
      </slot>
    </div>
    <div v-else>
      <slot>
        <div class="flex justify-center">
          <UIcon class="m-1 h-6 w-6" name="i-heroicons-document" />
          <div class="m-1">Drag &amp; drop here!</div>
        </div>
      </slot>
    </div>
    <div ref="dropZone" class="absolute h-full w-full"></div>
  </div>
</template>

<script setup lang="ts">
type Emits = {
  files: [payload: File[]];
};

const emit = defineEmits<Emits>();

const dropZone = ref<HTMLElement>();
const files = ref<File[]>([]);

const { isOverDropZone } = useDropZone(dropZone, (dropFiles) => {
  files.value = markRaw(dropFiles ?? []);
  emit("files", dropFiles ?? []);
});
</script>
