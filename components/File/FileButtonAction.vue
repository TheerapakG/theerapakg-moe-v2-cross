<script setup lang="ts">
import MimeType from "whatwg-mimetype";

type Props = {
  fileId: string;
  ariaLabel?: string;
};

const props = defineProps<Props>();
const { fileId } = toRefs(props);

type Emits = {
  delete: [];
};

const emit = defineEmits<Emits>();

const openModalUploadReplace = ref(false);
const openModalDelete = ref(false);

const fileStore = useFileStore();

const fileInfo = await fileStore.fetchFileComputed(fileId);

const defaultMime = {
  type: "text",
  subtype: "plain",
  parameters: undefined,
};

const mimeType = computed(() => {
  if (!fileInfo.value.mime) return defaultMime;
  try {
    return new MimeType(fileInfo.value.mime);
  } catch {
    return defaultMime;
  }
});

const items = computed(() => {
  const mime = mimeType.value;
  return [
    [
      {
        label: "View",
        icon: "i-heroicons-eye",
        to: {
          path: `/file/view/mime/${mime.type}/${mime.subtype}/${fileId.value}`,
          ...(mime.parameters && {
            query: Object.fromEntries(mime.parameters),
          }),
        },
      },
      {
        label: "Edit",
        icon: "i-heroicons-pencil",
        to: {
          path: `/file/edit/mime/${mime.type}/${mime.subtype}/${fileId.value}`,
          ...(mime.parameters && {
            query: Object.fromEntries(mime.parameters),
          }),
        },
      },
      {
        label: "Upload ...",
        icon: "i-heroicons-cloud-arrow-up",
        click: () => (openModalUploadReplace.value = true),
      },
      {
        label: "Download",
        icon: "i-heroicons-arrow-down-tray",
        to: `/file/download/${fileId.value}`,
      },
      {
        label: "Delete ...",
        icon: "i-heroicons-minus",
        click: () => (openModalDelete.value = true),
      },
    ],
  ];
});
</script>

<template>
  <div>
    <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
      <UButton
        variant="ghost"
        size="xl"
        icon="i-heroicons-ellipsis-horizontal-20-solid"
        :aria-label="ariaLabel"
        :ui="{ rounded: 'rounded-full' }"
      />
    </UDropdown>

    <FileModalUploadReplace
      v-model="openModalUploadReplace"
      :file-id="fileId"
    />
    <FileModalDelete
      v-model="openModalDelete"
      :file-id="fileId"
      @delete="emit('delete')"
    />
  </div>
</template>
