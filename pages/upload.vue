<template>
  <div>
    <div class="text-4xl m-8">UPLOAD</div>
    <div
      class="w-64 h-16 mx-auto rounded-lg border-2 border-black dark:border-white"
    >
      <DropZone
        :check-dragging-data="checkDraggingData"
        effect="copy"
        @dropped-data="onDroppedData"
      />
    </div>
    <button
      class="w-32 h-12 m-4 rounded-lg bg-black dark:bg-white text-white font-bold dark:text-black"
      @click="upload()"
    >
      Upload
    </button>
  </div>
</template>

<script setup lang="ts">
const file = shallowRef<File>(null);

const toastStore = useToastStore("layout");

const checkDraggingData = (data: DataTransfer | null) => {
  return data?.items.length === 1 && data.items[0].kind === "file";
};

const onDroppedData = (data: DataTransfer | null) => {
  file.value = data?.items[0]?.getAsFile();
};

const upload = async () => {
  const fileReader = new FileReader();
  fileReader.addEventListener("load", async (event) => {
    const { status } = await $fetch("/api/file/upload", {
      method: "POST",
      body: {
        file: file.value.name,
        content: event.target.result,
      },
    });

    if (status < 0) {
      const { ExclamationCircleIcon } = await import("@heroicons/vue/outline");
      toastStore.spawn({
        title: "Upload Error",
        description: "Cannot upload",
        icon: h(ExclamationCircleIcon),
      });
    } else {
      const { ExclamationCircleIcon } = await import("@heroicons/vue/outline");
      toastStore.spawn({
        title: "Upload Success",
        description: "Successfully uploaded",
        icon: h(ExclamationCircleIcon),
      });
    }
  });

  fileReader.readAsBinaryString(file.value);
};
</script>
