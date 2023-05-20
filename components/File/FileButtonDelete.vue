<template>
  <div class="relative">
    <VDropdown
      :distance="8"
      :boundary="pageContainerDom"
      placement="bottom"
      theme="context-menu"
    >
      <slot />

      <template #popper>
        <div
          class="flex flex-col place-content-center place-items-center gap-y-4"
        >
          <div>confirm</div>
          <button class="button-default h-12 w-32" @click="deleteFile">
            delete
          </button>
        </div>
      </template>
    </VDropdown>
  </div>
</template>

<script setup lang="tsx">
import { storeToRefs } from "pinia";

type Props = {
  fileId: string;
};

const props = defineProps<Props>();

type Emits = {
  refresh: [];
};

const emit = defineEmits<Emits>();

const pageStore = usePageStore();
const toastStore = useToastStore("layout");

const { pageContainerDom } = storeToRefs(pageStore);

const deleteFile = async () => {
  try {
    await $apiFetch(`/api/file/${props.fileId}`, {
      method: "DELETE",
    });
  } catch {
    const { ExclamationCircleIcon } = await import("@heroicons/vue/24/outline");
    toastStore.spawn({
      title: "Delete Error",
      description: "Cannot delete",
      icon: <ExclamationCircleIcon />,
    });
    emit("refresh");
    return;
  }
  const { ExclamationCircleIcon } = await import("@heroicons/vue/24/outline");
  toastStore.spawn({
    title: "Delete Success",
    description: "Successfully deleted",
    icon: <ExclamationCircleIcon />,
  });
  emit("refresh");
};
</script>
