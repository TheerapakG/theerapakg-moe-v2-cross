<template>
  <div class="flex flex-col place-content-start place-items-center">
    <FileViewAudio
      :file-id="(route.params.file as string)"
      class="w-full flex-grow"
    />
  </div>
</template>

<script setup lang="ts">
import { fileInfoKey } from "../provides";

const route = useRoute();
const fileInfo = inject(fileInfoKey, ref(null));

const url = useRequestURL();

useSeoMeta({
  ogTitle: fileInfo.value?.name,
  ogType: "website",
  ogUrl: url.origin + url.pathname,
  ogAudio: url.origin + fileInfo.value?.url,
});
</script>
