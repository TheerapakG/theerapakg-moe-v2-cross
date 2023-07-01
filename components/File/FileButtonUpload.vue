<script setup lang="tsx">
type Props = {
  fileId: string;
  ariaLabel?: string;
};

const props = defineProps<Props>();
const { fileId } = toRefs(props);

const fileStore = useFileStore();
const toast = useToast();

const files = ref<File[]>([]);
const onFilesDropped = (droppedFiles: File[]) => {
  files.value = markRaw(droppedFiles);
};

const uploadFile = async () => {
  const _files = files.value;
  if (_files.length > 1) {
    toast.add({
      title: "Upload Error",
      description: "Cannot upload more than one file",
      icon: "i-heroicons-exclaimation-circle",
      color: "red",
    });
    return;
  } else if (_files.length === 0) {
    toast.add({
      title: "Upload Error",
      description: "No file to upload",
      icon: "i-heroicons-exclaimation-circle",
      color: "red",
    });
    return;
  }

  const fileReader = new FileReader();
  fileReader.addEventListener("load", async (event) => {
    try {
      await fileStore.editFile(fileId.value, event.target?.result as string);
    } catch {
      toast.add({
        title: "Upload Error",
        description: "Cannot upload",
        icon: "i-heroicons-exclaimation-circle",
        color: "red",
      });
      return;
    }
    toast.add({
      title: "Upload Success",
      description: "Successfully uploaded",
      icon: "i-heroicons-exclaimation-circle",
    });
  });

  fileReader.readAsDataURL(_files[0]);
};
</script>

<template>
  <div class="relative">
    <UPopover>
      <slot>
        <UButton
          variant="ghost"
          size="xl"
          icon="i-heroicons-cloud-arrow-up"
          :aria-label="ariaLabel"
          :ui="{ rounded: 'rounded-full' }"
        />
      </slot>

      <template #panel>
        <div
          class="flex flex-col place-content-center place-items-center gap-y-4 p-4"
        >
          <div
            class="mx-auto h-16 w-64 rounded-lg border-2 border-gray-500 dark:border-gray-400"
          >
            <DropZone @files="onFilesDropped" />
          </div>
          <UButton
            label="upload"
            :disabled="files.length !== 1"
            @click="uploadFile()"
          />
        </div>
      </template>
    </UPopover>
  </div>
</template>
