<script setup lang="ts">
definePageMeta({
  pageTransition: false,
});

const route = useRoute();
const fileStore = useFileStore();

const fileId = route.params.file as string;

const fileInfo = await fileStore.fetchFile(fileId);

const url = useRequestURL();

useSeoMeta({
  ogTitle: fileInfo?.name,
  ogType: "website",
  ogUrl: url.origin + url.pathname,
  ogImage: fileInfo?.url,

  twitterCard: "summary_large_image",
  twitterImage: fileInfo?.url,
});
</script>

<template>
  <div class="flex flex-col place-content-start place-items-center">
    <FileViewImg
      :file-id="route.params.file as string"
      class="w-full flex-grow"
    />
  </div>
</template>
