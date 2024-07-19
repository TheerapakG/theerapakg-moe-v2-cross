<script setup lang="ts">
type Props = {
  fileId: string;
  modelValue: boolean;
};

const props = defineProps<Props>();
const { fileId } = toRefs(props);

type Emits = {
  "update:modelValue": [boolean];
};

const emit = defineEmits<Emits>();

const fileStore = useFileStore();
const toast = useToast();

const fileInfo = await fileStore.fetchFileComputed(fileId);

const pending = ref(false);

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

  pending.value = true;

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
    } finally {
      pending.value = false;
    }
    toast.add({
      title: "Upload Success",
      description: "Successfully uploaded",
      icon: "i-heroicons-exclaimation-circle",
    });
    emit("update:modelValue", false);
  });

  fileReader.readAsDataURL(_files[0]);
};
</script>

<template>
  <UModal
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <UCard>
      <template #header>
        <div class="text-center text-2xl">upload {{ fileInfo.name }}</div>
      </template>

      <div class="flex flex-col place-content-center place-items-center">
        <div
          class="h-16 w-64 rounded-lg border-2 border-gray-500 dark:border-gray-400"
        >
          <DropZone @files="onFilesDropped" />
        </div>
      </div>

      <template #footer>
        <div class="flex place-content-center place-items-center">
          <UButton
            color="black"
            size="xl"
            label="upload"
            :disabled="files.length !== 1"
            :pending="pending"
            @click="uploadFile()"
          />
        </div>
      </template>
    </UCard>
  </UModal>
</template>
