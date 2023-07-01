<script setup lang="ts">
const route = useRoute();
const fileStore = useFileStore();

const fileId = route.params.file as string;

const fileInfo = await fileStore.fetchFile(fileId);

const url = useRequestURL();

useSeoMeta({
  ogTitle: fileInfo?.name,
  ogType: "website",
  ogUrl: url.origin + url.pathname,
  ogAudio: url.origin + `/api/file/${fileId}/download`,
});
</script>

<template>
  <div class="flex flex-col place-content-start place-items-center">
    <FileViewAudio :file-id="fileId" class="w-full flex-grow" />
  </div>
</template>
