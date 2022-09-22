<template>
  <div v-if="pending">Getting file information...</div>
  <div v-else-if="fileInfoError">No such file found :(</div>
  <div v-else>
    <div>
      <div>File Info:</div>
      <div>name: {{ fileInfo.name }}</div>
      <div>size: {{ formatPretty(fileInfo.size) }} bytes</div>
    </div>
    <button
      class="rounded-lg w-32 h-12 bg-black dark:bg-white text-white font-bold dark:text-black"
      @click="startDownload(fileInfo.url, fileInfo.name)"
    >
      Download
    </button>
  </div>
</template>

<script setup lang="ts">
import { formatPretty } from "~~/utils/formatPretty";

definePageMeta({
  title: "theerapakg-moe-app",
  pageTransition: {
    name: "slide-left-uni",
    mode: "out-in",
  },
  name: "Download",
});

const route = useRoute();

const toastStore = useToastStore("layout");

const startDownload = (url: string, name: string) => {
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", name);
  link.click();
  toastStore.spawn({
    title: `Downloading ${name}`,
    description: `size: ${fileInfo.value.size} bytes`,
  });
};

const {
  pending,
  data: fileInfo,
  error: fileInfoError,
} = await useApiFetch(`/api/file/${route.params.file}/info`);
</script>
