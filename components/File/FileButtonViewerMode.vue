<template>
  <UDropdown :items="dropdownItems" :popper="{ placement: 'bottom-start' }">
    <UButton label="mode" />
  </UDropdown>
</template>

<script setup lang="ts">
import { FetchResult } from "nuxt/app";
import MimeType from "whatwg-mimetype";

type Props = {
  fileInfo:
    | (FetchResult<`/api/file/${string}/info`, "get"> & { id: string })
    | null;
};

const props = defineProps<Props>();

const viewFile = async (mode: "edit" | "view") => {
  if (!props.fileInfo) return;

  if (!props.fileInfo.mime) {
    await navigateTo(`/file/${mode}/mime/text/plain/${props.fileInfo.id}`);
    return;
  }

  try {
    const mimeType = new MimeType(props.fileInfo.mime);
    await navigateTo({
      path: `/file/${mode}/mime/${mimeType.type}/${mimeType.subtype}/${props.fileInfo.id}`,
      query: Object.fromEntries(mimeType.parameters),
    });
    return;
  } catch {
    await navigateTo(`/file/${mode}/mime/text/plain/${props.fileInfo.id}`);
  }
};

const dropdownItems = computed(() => [
  [
    {
      label: "view",
      icon: "i-heroicons-eye",
      disabled: !(props.fileInfo?.perms.user.view ?? false),
      click: async () => await viewFile("view"),
    },
    {
      label: "edit",
      icon: "i-heroicons-pencil",
      disabled: !(props.fileInfo?.perms.user.edit ?? false),
      click: async () => await viewFile("edit"),
    },
  ],
]);
</script>
