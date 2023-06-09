<template>
  <div class="flex place-content-center place-items-center gap-x-2">
    <USelectMenu
      v-model="templateSelection"
      class="w-48"
      :options="templateKeys"
      searchable
    />
    <UButton
      variant="ghost"
      size="xl"
      icon="i-heroicons-play"
      :ui="{ rounded: 'rounded-full' }"
      @click="run"
    />
  </div>
</template>

<script setup lang="tsx">
type Props = {
  fileId: string;
};

const props = defineProps<Props>();

const toast = useToast();

const templateSubroutes = {
  "Python 3.11": "python/3.11",
  "Python 3.10": "python/3.10",
  "Python 3.9": "python/3.9",
  "Python 3.8": "python/3.8",
  "Python 3.7": "python/3.7",
  "gcc 9": "gcc/c/9",
  "gcc 10": "gcc/c/10",
  "gcc 11": "gcc/c/11",
  "gcc 12": "gcc/c/12",
  "g++ 9": "gcc/cpp/9",
  "g++ 10": "gcc/cpp/10",
  "g++ 11": "gcc/cpp/11",
  "g++ 12": "gcc/cpp/12",
};

const templateKeys = useKeys(templateSubroutes);

const templateSelection = ref<keyof typeof templateSubroutes>();
const subrouteSelection = computed(() =>
  templateSelection.value
    ? templateSubroutes[templateSelection.value]
    : undefined
);

const run = async () => {
  const container = await (async () => {
    try {
      const { container } = await $apiFetch(
        `/api/container/run/file/${props.fileId}/${subrouteSelection.value}`,
        {
          method: "PUT",
        }
      );
      return container;
    } catch {
      toast.add({
        title: "Run Error",
        description: "Cannot run",
        icon: "i-heroicons-exclaimation-circle",
        color: "red",
      });
      return;
    }
  })();

  if (container) {
    toast.add({
      title: "Started running",
      description: "view logs",
      click: async () => {
        await navigateTo(`/container/${container}/logs`);
      },
      icon: "i-heroicons-exclaimation-circle",
    });
  }
};
</script>
