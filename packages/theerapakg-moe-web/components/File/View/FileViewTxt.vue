<script setup lang="ts">
import { ofetch } from "ofetch";

type Props = {
  fileId: string;
  lang?: string;
  activatePortal?: boolean;
};

const props = defineProps<Props>();
const { fileId } = toRefs(props);

const fileStore = useFileStore();

const { data: fileInfo } = await useAsyncData(
  () => fileStore.fetchFile(fileId.value),
  {
    watch: [fileId],
  },
);

const { data } = await useAsyncData(
  async () => {
    const url = fileInfo.value?.url;
    if (!url) return;
    return await ofetch(url, {
      responseType: "text",
    });
  },
  {
    watch: [fileInfo],
  },
);
</script>

<template>
  <div class="relative">
    <ClientOnly v-if="data">
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
