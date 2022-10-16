<template>
  <div class="relative">
    <VDropdown
      :distance="8"
      :boundary="pageContainerDom"
      placement="bottom"
      theme="context-menu"
      @show="open = true"
      @hide="open = false"
    >
      <slot />

      <template #popper>
        <div
          class="flex flex-col place-content-center place-items-center gap-y-4"
        >
          <div>confirm</div>
          <button
            class="h-12 w-32 rounded-lg bg-black font-bold text-white dark:bg-white dark:text-black"
            @click="deleteFile"
          >
            delete
          </button>
        </div>
      </template>
    </VDropdown>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";

interface Props {
  fileId: string;
}

const props = defineProps<Props>();

interface Emits {
  (event: "refresh"): void;
}

const emit = defineEmits<Emits>();

const pageStore = usePageStore();
const toastStore = useToastStore("layout");

const { pageContainerDom } = storeToRefs(pageStore);

const open = ref(false);

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
      icon: h(ExclamationCircleIcon),
    });
    emit("refresh");
    return;
  }
  const { ExclamationCircleIcon } = await import("@heroicons/vue/24/outline");
  toastStore.spawn({
    title: "Delete Success",
    description: "Successfully deleted",
    icon: h(ExclamationCircleIcon),
  });
  emit("refresh");
};
</script>
