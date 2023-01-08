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
      <portal v-if="activatePortal" to="file-menu-left">
        <FileRun :file-id="fileId" />
      </portal>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
interface Props {
  fileId: string;
  lang?: string;
  activatePortal?: boolean;
}

const props = defineProps<Props>();

const data = await $apiFetch<string>(`/api/file/${props.fileId}/download`, {
  responseType: "text",
});
</script>
