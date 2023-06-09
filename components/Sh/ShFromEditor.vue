<template>
  <TextInputEditor :model-value="props.from" @update:model-value="rename" />
</template>

<script setup lang="tsx">
type Props = {
  from: string;
};

const props = defineProps<Props>();

type Emits = {
  refresh: [];
};

const emit = defineEmits<Emits>();

const toast = useToast();

const rename = async (name: string) => {
  try {
    await $apiFetch(`/api/sh/name/${props.from}/rename/${name}`, {
      method: "POST",
    });
  } catch {
    toast.add({
      title: "Rename Error",
      description: "Cannot rename",
      icon: "i-heroicons-exclaimation-circle",
      color: "red",
    });
    emit("refresh");
    return;
  }
  toast.add({
    title: "Rename Success",
    description: "Successfully renamed",
    icon: "i-heroicons-exclaimation-circle",
  });
  emit("refresh");
};
</script>
