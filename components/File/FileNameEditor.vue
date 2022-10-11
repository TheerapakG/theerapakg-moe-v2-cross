<template>
  <div class="w-full">
    <div v-if="!edit" class="flex place-content-center place-items-center">
      <NuxtLink class="flex-grow" :to="`/file/download/${props.fileId}`">
        {{ props.name }}
      </NuxtLink>
      <button
        @click="
          editName = props.name;
          edit = true;
        "
      >
        <PencilIcon class="w-6 h-6" />
      </button>
    </div>
    <div v-else class="flex place-content-center place-items-center">
      <input v-model="editName" class="input-default flex-grow text-center" />
      <button
        @click="
          edit = false;
          rename();
        "
      >
        <CheckIcon class="w-6 h-6" />
      </button>
      <button @click="edit = false">
        <XIcon class="w-6 h-6" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PencilIcon, CheckIcon, XIcon } from "@heroicons/vue/outline";

interface Props {
  fileId: string;
  name: string;
}

const props = defineProps<Props>();

interface Emits {
  (event: "refresh"): void;
}

const emit = defineEmits<Emits>();

const toastStore = useToastStore("layout");

const edit = ref(false);
const editName = ref("");

const rename = async () => {
  try {
    await $apiFetch(`/api/file/${props.fileId}/rename`, {
      method: "POST",
      params: {
        name: editName.value,
      },
    });
  } catch {
    const { ExclamationCircleIcon } = await import("@heroicons/vue/outline");
    toastStore.spawn({
      title: "Rename Error",
      description: "Cannot rename",
      icon: h(ExclamationCircleIcon),
    });
    emit("refresh");
    return;
  }
  const { ExclamationCircleIcon } = await import("@heroicons/vue/outline");
  toastStore.spawn({
    title: "Rename Success",
    description: "Successfully renamed",
    icon: h(ExclamationCircleIcon),
  });
  emit("refresh");
};
</script>
