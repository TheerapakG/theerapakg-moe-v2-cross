<template>
  <TextInputEditor :model-value="props.from" @update:model-value="rename" />
</template>

<script setup lang="tsx">
interface Props {
  from: string;
}

const props = defineProps<Props>();

interface Emits {
  (event: "refresh"): void;
}

const emit = defineEmits<Emits>();

const toastStore = useToastStore("layout");

const rename = async (name: string) => {
  try {
    await $apiFetch(`/api/sh/name/${props.from}/rename/${name}`, {
      method: "POST",
    });
  } catch {
    const { ExclamationCircleIcon } = await import("@heroicons/vue/24/outline");
    toastStore.spawn({
      title: "Rename Error",
      description: "Cannot rename",
      icon: <ExclamationCircleIcon />,
    });
    emit("refresh");
    return;
  }
  const { ExclamationCircleIcon } = await import("@heroicons/vue/24/outline");
  toastStore.spawn({
    title: "Rename Success",
    description: "Successfully renamed",
    icon: <ExclamationCircleIcon />,
  });
  emit("refresh");
};
</script>
