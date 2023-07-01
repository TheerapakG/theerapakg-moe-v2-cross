<script setup lang="tsx">
type Props = {
  fileId: string;
  name: string;
  download?: boolean;
};

const props = withDefaults(defineProps<Props>(), { download: true });
const { fileId } = toRefs(props);

const fileStore = useFileStore();
const toast = useToast();

const rename = async (name: string) => {
  try {
    await fileStore.renameFile(fileId.value, name);
  } catch {
    toast.add({
      title: "Rename Error",
      description: "Cannot rename",
      icon: "i-heroicons-exclaimation-circle",
      color: "red",
    });
    return;
  }
  toast.add({
    title: "Rename Success",
    description: "Successfully renamed",
    icon: "i-heroicons-exclaimation-circle",
  });
};
</script>

<template>
  <TextInputEditor :model-value="name" @update:model-value="rename">
    <NuxtLink v-if="download" :to="`/file/download/${fileId}`">
      <div class="overflow-hidden text-ellipsis whitespace-nowrap">
        {{ name }}
      </div>
    </NuxtLink>
    <div v-else class="overflow-hidden text-ellipsis whitespace-nowrap">
      {{ name }}
    </div>
  </TextInputEditor>
</template>
