<template>
  <div class="flex flex-col place-content-start place-items-center">
    <FileViewVideo
      :file-id="(route.params.file as string)"
      class="w-full flex-grow"
    />
  </div>
</template>

<script setup lang="ts">
import { useFileInfoState } from "../states";

const fileInfoState = useFileInfoState();

const route = useRoute();

const url = useRequestURL();

useSeoMeta({
  ogTitle: fileInfoState.value?.name,
  ogType: "video.other",
  ogUrl: url.origin + url.pathname,
  ogVideo: url.origin + fileInfoState.value?.url,
});
</script>
