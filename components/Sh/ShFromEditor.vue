<template>
  <TextInputEditor :model-value="props.from" @update:model-value="rename" />
</template>

<script setup lang="ts">
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
    await $apiFetch(`/api/sh/${props.from}/rename/${name}`, {
      method: "POST",
    });
  } catch {
    const { ExclamationCircleIcon } = await import("@heroicons/vue/outline");
    toastStore.spawn({
      title: "Rename Error",
      description: "Cannot rename",
      icon: h(ExclamationCircleIcon),
    });
    emit("refresh");
    return;
  }
  const { ExclamationCircleIcon } = await import("@heroicons/vue/outline");
  toastStore.spawn({
    title: "Rename Success",
    description: "Successfully renamed",
    icon: h(ExclamationCircleIcon),
  });
  emit("refresh");
};
</script>
