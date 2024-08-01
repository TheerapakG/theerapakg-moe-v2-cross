<script setup lang="ts">
import { formatPretty } from "~/utils/formatPretty";

definePageMeta({
  title: "theerapakg-moe-app",
  name: "Download",
});

const route = useRoute();
const fileStore = useFileStore();

const toast = useToast();

const fileId = route.params.file as string;
const viewTarget = await useFileTarget(fileId, "view");

const fileInfo = await fileStore.fetchFile(fileId);

const startDownload = () => {
  const { url, name } = fileInfo ?? {};
  if (!url || !name) return;
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", name);
  link.click();
  link.remove();
  toast.add({
    title: `Downloading ${name}`,
    description: `size: ${fileInfo?.size} bytes`,
  });
};
</script>

<template>
  <div v-if="!fileInfo">Getting file information...</div>
  <div v-else>
    <div>
      <div>File Info:</div>
      <div>name: {{ fileInfo.name }}</div>
      <div v-if="fileInfo.size">
        size: {{ formatPretty(fileInfo.size) }} bytes
      </div>
    </div>
    <div class="flex place-content-center place-items-center gap-2">
      <UButton size="xl" label="view online" :to="viewTarget" />
      <UButton
        color="black"
        size="xl"
        label="download"
        @click="startDownload"
      />
    </div>
  </div>
</template>
