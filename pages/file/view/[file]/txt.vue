<template>
  <div class="flex flex-col place-content-start place-items-center">
    <MonacoEditor
      class="w-full flex-grow"
      :options="{
        fontLigatures: true,
        readOnly: true,
        value: data,
        ...(route.query.lang && { language: route.query.lang }),
      }"
    />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

const data = await $apiFetch(`/api/file/${route.params.file}/download`, {
  responseType: "text",
});
</script>
