<template>
  <TextInputEditor :model-value="props.name" @update:model-value="rename">
    <NuxtLink :to="`/file/download/${props.fileId}`">
      {{ props.name }}
    </NuxtLink>
  </TextInputEditor>
</template>

<script setup lang="ts">
interface Props {
  fileId: string;
  name: string;
}

const props = defineProps<Props>();

interface Emits {
  (event: "refresh"): void;
}

const emit = defineEmits<Emits>();

const toastStore = useToastStore("layout");

const rename = async (newname: string) => {
  try {
    await $apiFetch(`/api/file/${props.fileId}/rename`, {
      method: "PUT",
      params: {
        name: newname,
      },
    });
  } catch {
    const { ExclamationCircleIcon } = await import("@heroicons/vue/24/outline");
    toastStore.spawn({
      title: "Rename Error",
      description: "Cannot rename",
      icon: h(ExclamationCircleIcon),
    });
    emit("refresh");
    return;
  }
  const { ExclamationCircleIcon } = await import("@heroicons/vue/24/outline");
  toastStore.spawn({
    title: "Rename Success",
    description: "Successfully renamed",
    icon: h(ExclamationCircleIcon),
  });
  emit("refresh");
};
</script>
