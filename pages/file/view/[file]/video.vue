<template>
  <div class="flex flex-col place-content-start place-items-center">
    <FileViewVideo :file-id="fileId" class="w-full flex-grow" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const fileStore = useFileStore();

const fileId = route.params.file as string;

const fileInfo = await fileStore.fetchFile(fileId);

const url = useRequestURL();

useSeoMeta({
  ogTitle: fileInfo?.name,
  ogType: "video.other",
  ogUrl: url.origin + url.pathname,
  ogVideo: url.origin + `/api/file/${fileId}/download`,
});
</script>
