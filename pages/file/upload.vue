<template>
  <div>
    <div class="m-8 text-4xl">UPLOAD</div>
    <div
      class="m-8 mx-auto h-16 w-64 rounded-lg border-2 border-gray-500 dark:border-gray-400"
    >
      <DropZone @files="onFilesDropped" />
    </div>
    <UButton
      color="black"
      size="xl"
      label="upload"
      :disabled="files.length === 0"
      @click="upload()"
    />
  </div>
</template>

<script setup lang="tsx">
definePageMeta({
  title: "theerapakg-moe-app: upload",
  name: "Upload",
  perms: ["file:edit"],
});

const fileStore = useFileStore();

const toast = useToast();

const files = ref<File[]>([]);
const onFilesDropped = (droppedFiles: File[]) => {
  files.value = markRaw(droppedFiles);
};

const upload = async () => {
  const _files = files.value;
  if (_files.length === 0) {
    toast.add({
      title: "Upload Error",
      description: "No file to upload",
      icon: "i-heroicons-exclaimation-circle",
      color: "red",
    });
    return;
  }

  _files.map((file) => {
    const name = file.name;
    const fileReader = new FileReader();
    fileReader.addEventListener("load", async (event) => {
      try {
        const upload = await fileStore.uploadFile(
          name,
          event.target?.result as string
        );
        toast.add({
          title: "Upload Success",
          description: "go to download page",
          click: async () => {
            await navigateTo(`/file/download/${upload.id}`);
          },
          icon: "i-heroicons-exclaimation-circle",
        });
      } catch {
        toast.add({
          title: "Upload Error",
          description: "Cannot upload",
          icon: "i-heroicons-exclaimation-circle",
          color: "red",
        });
        return;
      }
    });

    fileReader.readAsDataURL(file);
  });
};
</script>
