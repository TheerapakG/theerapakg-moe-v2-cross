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

<script setup lang="tsx">
type Props = {
  fileId: string;
  ariaLabel?: string;
};

const props = defineProps<Props>();

type Emits = {
  refresh: [];
};

const emit = defineEmits<Emits>();

const toast = useToast();

const deleteFile = async () => {
  try {
    await $apiFetch(`/api/file/${props.fileId}`, {
      method: "DELETE",
    });
  } catch {
    toast.add({
      title: "Delete Error",
      description: "Cannot delete",
      icon: "i-heroicons-exclaimation-circle",
      color: "red",
    });
    emit("refresh");
    return;
  }
  toast.add({
    title: "Delete Success",
    description: "Successfully deleted",
    icon: "i-heroicons-exclaimation-circle",
  });
  emit("refresh");
};
</script>
