<template>
  <TextInputEditor :model-value="props.to" @update:model-value="changeTarget" />
</template>

<script setup lang="ts">
interface Props {
  from: string;
  to: string;
}

const props = defineProps<Props>();

interface Emits {
  (event: "refresh"): void;
}

const emit = defineEmits<Emits>();

const toastStore = useToastStore("layout");

const changeTarget = async (target: string) => {
  try {
    await $apiFetch(`/api/sh/${props.from}`, {
      method: "PUT",
      params: {
        target: encodeURIComponent(target),
      },
    });
  } catch {
    const { ExclamationCircleIcon } = await import("@heroicons/vue/24/outline");
    toastStore.spawn({
      title: "Error Changing Target",
      description: "Cannot change target",
      icon: h(ExclamationCircleIcon),
    });
    emit("refresh");
    return;
  }
  const { ExclamationCircleIcon } = await import("@heroicons/vue/24/outline");
  toastStore.spawn({
    title: "Target Changed",
    description: "Successfully changed target",
    icon: h(ExclamationCircleIcon),
  });
  emit("refresh");
};
</script>
