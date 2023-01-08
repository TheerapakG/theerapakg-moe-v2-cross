<template>
  <NuxtLink
    class="relative"
    :to="{
      path: `/file/edit/mime/${mimeType.type}/${mimeType.subtype}/${props.fileId}`,
      ...(mimeType.parameters && {
        query: Object.fromEntries(mimeType.parameters),
      }),
    }"
  >
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
import MimeType from "whatwg-mimetype";

interface Props {
  fileId: string;
  mime: string;
}

const props = defineProps<Props>();

const mimeType = computed(() => {
  try {
    return new MimeType(props.mime);
  } catch {
    return {
      type: "text",
      subtype: "plain",
      parameters: undefined,
    };
  }
});
</script>
