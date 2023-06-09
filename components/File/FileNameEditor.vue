<template>
  <TextInputEditor :model-value="props.name" @update:model-value="rename">
    <NuxtLink v-if="download" :to="`/file/download/${props.fileId}`">
      <div class="overflow-hidden text-ellipsis whitespace-nowrap">
        {{ props.name }}
      </div>
    </NuxtLink>
    <div v-else class="overflow-hidden text-ellipsis whitespace-nowrap">
      {{ props.name }}
    </div>
  </TextInputEditor>
</template>

<script setup lang="tsx">
type Props = {
  fileId: string;
  name: string;
  download?: boolean;
};

const props = withDefaults(defineProps<Props>(), { download: true });

type Emits = {
  refresh: [];
};

const emit = defineEmits<Emits>();

const toast = useToast();

const rename = async (newname: string) => {
  try {
    await $apiFetch(`/api/file/${props.fileId}/rename`, {
      method: "PUT",
      params: {
        name: newname,
      },
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
