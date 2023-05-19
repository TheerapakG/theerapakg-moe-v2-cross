<template>
  <div class="flex flex-col place-content-start place-items-center">
    <FileViewVideo
      :file-id="(route.params.file as string)"
      class="w-full flex-grow"
    />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

const { data: fileInfo } = await useApiFetch(
  `/api/file/${route.params.file}/info`
);

const url = useRequestURL();

useSeoMeta({
  ogTitle: fileInfo.value?.name,
  ogType: "video.other",
  ogUrl: url.origin + url.pathname,
  ogVideo: url.origin + fileInfo.value?.url,
});
</script>
