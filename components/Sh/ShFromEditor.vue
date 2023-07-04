<script setup lang="ts">
type Props = {
  from: string;
};

const props = defineProps<Props>();
const { from } = toRefs(props);

type Emits = {
  refresh: [];
};

const emit = defineEmits<Emits>();

const toast = useToast();

const rename = async (name: string) => {
  try {
    await $apiFetch(
      `/api/sh/name/${encodeURIComponent(
        from.value
      )}/rename/${encodeURIComponent(name)}`,
      {
        method: "POST",
      }
    );
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

<template>
  <TextInputEditor :model-value="from" @update:model-value="rename" />
</template>
