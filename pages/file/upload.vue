<template>
  <div>
    <div class="m-8 text-4xl">UPLOAD</div>
    <div
      class="mx-auto h-16 w-64 rounded-lg border-2 border-black dark:border-white"
    >
      <DropZone
        :check-dragging-data="checkDraggingData"
        effect="copy"
        @dropped-data="onDroppedData"
      />
    </div>
    <button class="button-default m-4 h-12 w-32 rounded-lg" @click="upload()">
      Upload
    </button>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: "theerapakg-moe-app: upload",
  name: "Upload",
  perms: ["perms:file:edit"],
});

const file = shallowRef<File | null>(null);

const toastStore = useToastStore("layout");

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

  const fileReader = new FileReader();
  fileReader.addEventListener("load", async (event) => {
    try {
      await $apiFetch("/api/file/upload", {
        method: "POST",
        body: {
          file: file.value?.name,
          content: event.target?.result,
        },
      });
    } catch {
      const { ExclamationCircleIcon } = await import(
        "@heroicons/vue/24/outline"
      );
      toastStore.spawn({
        title: "Upload Error",
        description: "Cannot upload",
        icon: h(ExclamationCircleIcon),
      });
      return;
    }
    const { ExclamationCircleIcon } = await import("@heroicons/vue/24/outline");
    toastStore.spawn({
      title: "Upload Success",
      description: "Successfully uploaded",
      icon: h(ExclamationCircleIcon),
    });
  });

  fileReader.readAsDataURL(file.value);
};
</script>
