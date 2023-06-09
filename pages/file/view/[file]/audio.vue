<template>
  <div class="flex flex-col place-content-start place-items-center">
    <FileViewAudio
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
  ogType: "website",
  ogUrl: url.origin + url.pathname,
  ogAudio: url.origin + fileInfoState.value?.url,
});
</script>
