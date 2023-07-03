<script setup lang="ts">
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

const viewTarget = await useFileTarget(fileId, "view");
const editTarget = await useFileTarget(fileId, "edit");

const items = computed(() => {
  return [
    [
      {
        label: "View",
        icon: "i-heroicons-eye",
        to: viewTarget.value,
      },
      {
        label: "Edit",
        icon: "i-heroicons-pencil",
        to: editTarget.value,
      },
    ],
    [
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
    ],
    [
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
