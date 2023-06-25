<template>
  <div>
    <slot :to="target">
      <UButton
        variant="ghost"
        size="xl"
        icon="i-heroicons-pencil"
        :aria-label="ariaLabel"
        :ui="{ rounded: 'rounded-full' }"
        :to="target"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
import MimeType from "whatwg-mimetype";
import type { RouteLocationRaw } from "vue-router";

type Props = {
  fileId: string;
  ariaLabel?: string;
};

const props = defineProps<Props>();
const { fileId } = toRefs(props);

const fileStore = useFileStore();

const fileInfo = await fileStore.fetchFileComputed(fileId);

const defaultMime = {
  type: "text",
  subtype: "plain",
  parameters: undefined,
};

const mimeType = computed(() => {
  if (!fileInfo.value) return defaultMime;
  try {
    return new MimeType(fileInfo.value?.mime);
  } catch {
    return defaultMime;
  }
});

const target = computed<RouteLocationRaw>(() => {
  const mime = mimeType.value;

  return {
    path: `/file/edit/mime/${mime.type}/${mime.subtype}/${fileId.value}`,
    ...(mime.parameters && {
      query: Object.fromEntries(mime.parameters),
    }),
  };
});
</script>
