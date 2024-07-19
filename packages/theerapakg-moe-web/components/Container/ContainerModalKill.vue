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

const killContainer = async () => {
  pending.value = true;

  try {
    await containerStore.killContainer(containerId.value);
  } catch {
    toast.add({
      title: "Kill Error",
      description: "Cannot kill",
      icon: "i-heroicons-exclaimation-circle",
      color: "red",
    });
    return;
  } finally {
    pending.value = false;
  }

  toast.add({
    title: "Kill Success",
    description: "Successfully killed",
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
          confirm killing {{ containerId }}
        </div>
      </template>

      <div class="flex place-content-center place-items-center">
        <UButton
          color="black"
          size="xl"
          label="kill"
          :pending="pending"
          @click="killContainer"
        />
      </div>
    </UCard>
  </UModal>
</template>
