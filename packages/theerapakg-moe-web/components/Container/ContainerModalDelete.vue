<script setup lang="ts">
type Props = {
  containerId: string;
  modelValue: boolean;
};

const props = defineProps<Props>();
const { containerId } = toRefs(props);

type Emits = {
  "update:modelValue": [boolean];
  delete: [];
};

const emit = defineEmits<Emits>();

const containerStore = useContainerStore();
const toast = useToast();

const pending = ref(false);

const deleteContainer = async () => {
  pending.value = true;

  try {
    await containerStore.deleteContainer(containerId.value);
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
          confirm deleting {{ containerId }}
        </div>
      </template>

      <div class="flex place-content-center place-items-center">
        <UButton
          color="black"
          size="xl"
          label="delete"
          :pending="pending"
          @click="deleteContainer"
        />
      </div>
    </UCard>
  </UModal>
</template>
