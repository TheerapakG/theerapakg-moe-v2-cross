<template>
  <div class="flex flex-col place-content-start place-items-center">
    <ClientOnly>
      <div class="relative w-full flex-grow">
        <MonacoEditor
          class="absolute inset-0"
          :options="{
            fontLigatures: true,
            readOnly: true,
            value: data,
            ...(route.query.lang && { language: route.query.lang as string }),
          }"
        />
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

const data = await $apiFetch<string>(
  `/api/file/${route.params.file}/download`,
  {
    responseType: "text",
  }
);
</script>
