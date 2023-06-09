<template>
  <div v-if="pending">Getting file information...</div>
  <div v-else-if="fileInfoError">No such file found :(</div>
  <div v-else-if="!fileInfo"></div>
  <div v-else>
    <div>
      <div>File Info:</div>
      <div>name: {{ fileInfo.name }}</div>
      <div>size: {{ formatPretty(fileInfo.size) }} bytes</div>
    </div>
    <div class="flex place-content-center place-items-center gap-2">
      <FileButtonView
        :file-id="(route.params.file as string)"
        :mime="fileInfo.mime"
      >
        <UButton size="xl" label="view online" />
      </FileButtonView>
      <UButton
        color="black"
        size="xl"
        label="download"
        @click="startDownload"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPretty } from "~/utils/formatPretty";

definePageMeta({
  title: "theerapakg-moe-app",
  pageTransition: {
    name: "slide-left-uni",
    mode: "out-in",
  },
  name: "Download",
});

const route = useRoute();

const toast = useToast();

const startDownload = () => {
  const { url, name } = fileInfo.value ?? {};
  if (!url || !name) return;
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", name);
  link.click();
  link.remove();
  toast.add({
    title: `Downloading ${name}`,
    description: `size: ${fileInfo.value?.size} bytes`,
  });
};

const {
  pending,
  data: fileInfo,
  error: fileInfoError,
} = await useApiFetch(`/api/file/${route.params.file}/info`);
</script>
