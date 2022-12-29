<template>
  <div class="relative">
    <ClientOnly>
      <MonacoEditor
        class="absolute inset-0"
        :options="{
              fontLigatures: true,
              readOnly: true,
              value: data,
              ...(lang && { language: lang as string }),
            }"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
interface Props {
  fileId: string;
  lang?: string;
}

const props = defineProps<Props>();

const data = await $apiFetch<string>(`/api/file/${props.fileId}/download`, {
  responseType: "text",
});
</script>
