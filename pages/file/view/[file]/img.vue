<script setup lang="ts">
definePageMeta({
  pageTransition: false,
});

const route = useRoute();
</script>

<template>
  <div class="flex flex-col place-content-start place-items-center">
    <FileViewImg
      :file-id="(route.params.file as string)"
      class="w-full flex-grow"
    />
  </div>
</template>
