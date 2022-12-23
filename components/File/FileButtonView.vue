<template>
  <button class="relative" @click="viewFile()">
    <slot />
  </button>
</template>

<script setup lang="ts">
import MimeType from "whatwg-mimetype";

interface Props {
  fileId: string;
  mime: string;
}

const props = defineProps<Props>();

const viewFile = async () => {
  const mimeType = new MimeType(props.mime);
  await navigateTo({
    path: `/file/view/mime/${mimeType.type}/${mimeType.subtype}/${props.fileId}`,
    query: Object.fromEntries(mimeType.parameters),
  });
};
</script>
