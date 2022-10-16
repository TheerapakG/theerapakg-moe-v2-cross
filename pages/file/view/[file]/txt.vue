<template>
  <MonacoEditor
    :options="{ fontLigatures: true, readOnly: true, value: data }"
  />
</template>

<script setup lang="ts">
const route = useRoute();
const data = await $apiFetch(`/api/file/${route.params.file}/download`);
</script>
