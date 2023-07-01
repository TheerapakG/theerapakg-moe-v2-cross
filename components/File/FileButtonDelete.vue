<script setup lang="tsx">
type Props = {
  fileId: string;
  ariaLabel?: string;
};

const props = defineProps<Props>();
const { fileId } = toRefs(props);

type Emits = {
  delete: [];
};

const emit = defineEmits<Emits>();

const fileStore = useFileStore();
const toast = useToast();

const deleteFile = async () => {
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
  }
  toast.add({
    title: "Delete Success",
    description: "Successfully deleted",
    icon: "i-heroicons-exclaimation-circle",
  });
  emit("delete");
};
</script>

<template>
  <div class="relative">
    <UPopover>
      <slot>
        <UButton
          variant="ghost"
          size="xl"
          icon="i-heroicons-minus"
          :aria-label="ariaLabel"
          :ui="{ rounded: 'rounded-full' }"
        />
      </slot>

      <template #panel>
        <div
          class="flex flex-col place-content-center place-items-center gap-y-2 p-4"
        >
          <div>confirm</div>
          <UButton label="delete" @click="deleteFile" />
        </div>
      </template>
    </UPopover>
  </div>
</template>
