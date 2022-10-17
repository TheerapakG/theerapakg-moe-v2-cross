<template>
  <div class="flex h-full flex-col">
    <div>{{ fileInfo.name }}</div>
    <NuxtPage class="flex-grow" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const file = ref(route.params.file as string);

const {
  pending,
  data: fileInfo,
  error: fileInfoError,
} = await useApiFetch(`/api/file/${route.params.file}/info`);
</script>
