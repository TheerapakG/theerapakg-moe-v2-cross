<script setup lang="ts">
type Props = {
  fileId: string;
};

const props = defineProps<Props>();
const { fileId } = toRefs(props);

const { data: perms } = useApiFetch(
  `/api/file/${props.fileId}/user/current/perm`
);

const viewFile = async (mode: "edit" | "view") => {
  await navigateTo(`/file/${mode}/${fileId.value}`);
};

const dropdownItems = computed(() => [
  [
    {
      label: "view",
      icon: "i-heroicons-eye",
      disabled: !(perms.value?.view ?? false),
      click: async () => await viewFile("view"),
    },
    {
      label: "edit",
      icon: "i-heroicons-pencil",
      disabled: !(perms.value?.edit ?? false),
      click: async () => await viewFile("edit"),
    },
  ],
]);
</script>

<template>
  <UDropdown :items="dropdownItems" :popper="{ placement: 'bottom-start' }">
    <UButton label="mode" />
  </UDropdown>
</template>
