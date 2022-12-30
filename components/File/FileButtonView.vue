<template>
  <NuxtLink
    class="relative"
    :to="{
      path: `/file/view/mime/${mimeType.type}/${mimeType.subtype}/${props.fileId}`,
      query: Object.fromEntries(mimeType.parameters),
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

const mimeType = computed(() => new MimeType(props.mime));
</script>
