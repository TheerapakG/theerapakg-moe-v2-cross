<script setup lang="ts">
type Props = {
  fileId: string;
  modelValue: boolean;
};

const props = defineProps<Props>();
const { fileId } = toRefs(props);

type Emits = {
  "update:modelValue": [boolean];
  delete: [];
};

const emit = defineEmits<Emits>();

const fileStore = useFileStore();
const toast = useToast();

const fileInfo = await fileStore.fetchFileComputed(fileId);

const pending = ref(false);

const deleteFile = async () => {
  pending.value = true;

  try {
    await fileStore.deleteFile(fileId.value);
  } catch {
    toast.add({
      title: "Delete Error",
      description: "Cannot delete",
      icon: "i-heroicons-exclaimation-circle",
      color: "red",
    });
    return;
  } finally {
    pending.value = false;
  }

  toast.add({
    title: "Delete Success",
    description: "Successfully deleted",
    icon: "i-heroicons-exclaimation-circle",
  });
  emit("delete");
  emit("update:modelValue", false);
};
</script>

<template>
  <UModal
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <UCard>
      <template #header>
        <div class="text-center text-2xl">
          confirm deleting {{ fileInfo.name }}
        </div>
      </template>

      <div class="flex place-content-center place-items-center">
        <UButton
          color="black"
          size="xl"
          label="delete"
          :pending="pending"
          @click="deleteFile"
        />
      </div>
    </UCard>
  </UModal>
</template>
