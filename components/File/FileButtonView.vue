<template>
  <div>
    <slot :to="target">
      <UButton
        variant="ghost"
        size="xl"
        icon="i-heroicons-eye"
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
  mime: string;
  ariaLabel?: string;
};

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

const target = computed<RouteLocationRaw>(() => {
  const mime = mimeType.value;

  return {
    path: `/file/view/mime/${mime.type}/${mime.subtype}/${props.fileId}`,
    ...(mime.parameters && {
      query: Object.fromEntries(mime.parameters),
    }),
  };
});
</script>
