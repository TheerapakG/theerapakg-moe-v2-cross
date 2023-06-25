<template>
  <div>
    <div class="m-8 text-4xl">UPLOAD</div>
    <div
      class="m-8 mx-auto h-16 w-64 rounded-lg border-2 border-gray-500 dark:border-gray-400"
    >
      <DropZone
        :check-dragging-data="checkDraggingData"
        effect="copy"
        @dropped-data="onDroppedData"
      />
    </div>
    <UButton color="black" size="xl" label="upload" @click="upload()" />
  </div>
</template>

<script setup lang="tsx">
definePageMeta({
  title: "theerapakg-moe-app: upload",
  name: "Upload",
  perms: ["file:edit"],
});

const file = shallowRef<File | null>(null);

const fileStore = useFileStore();

const toast = useToast();

const checkDraggingData = (
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
) => {
  return data?.length === 1 && data[0].kind === "file";
};

const onDroppedData = (
  data:
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
) => {
  file.value = data?.[0]?.kind === "file" ? data[0].file : null;
};

const upload = async () => {
  if (!file.value) return;

  const name = file.value.name;

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

  fileReader.readAsDataURL(file.value);
};
</script>
