<template>
  <TextInputEditor :model-value="props.to" @update:model-value="changeTarget" />
</template>

<script setup lang="tsx">
type Props = {
  from: string;
  to: string;
};

const props = defineProps<Props>();

type Emits = {
  refresh: [];
};

const emit = defineEmits<Emits>();

const toast = useToast();

const changeTarget = async (target: string) => {
  try {
    await $apiFetch(`/api/sh/name/${encodeURIComponent(props.from)}`, {
      method: "PUT",
      params: { target },
    });
  } catch {
    toast.add({
      title: "Error Changing Target",
      description: "Cannot change target",
      icon: "i-heroicons-exclaimation-circle",
      color: "red",
    });
    emit("refresh");
    return;
  }
  toast.add({
    title: "Target Changed",
    description: "Successfully changed target",
    icon: "i-heroicons-exclaimation-circle",
  });
  emit("refresh");
};
</script>
