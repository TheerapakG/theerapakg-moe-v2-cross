<template>
  <TextInputEditor :model-value="to" @update:model-value="changeTarget" />
</template>

<script setup lang="tsx">
type Props = {
  from: string;
  to: string;
};

const props = defineProps<Props>();
const { from } = toRefs(props);

type Emits = {
  refresh: [];
};

const emit = defineEmits<Emits>();

const toast = useToast();

const changeTarget = async (target: string) => {
  try {
    await $apiFetch(`/api/sh/name/${encodeURIComponent(from.value)}`, {
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
