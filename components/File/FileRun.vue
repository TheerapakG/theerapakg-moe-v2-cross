<template>
  <div class="flex place-content-center place-items-center">
    <select v-model="templateSelection" class="input-default">
      <option
        v-for="(_, template) in templateSubroutes"
        :key="template"
        class="bg-white dark:bg-black"
      >
        {{ template }}
      </option>
    </select>
    <button class="icon-button t-transition-default" @click="run">
      <PlayIcon class="h-6 w-6" />
    </button>
  </div>
</template>

<script setup lang="tsx">
import { PlayIcon } from "@heroicons/vue/24/outline";
import { NuxtLink } from "#components";

type Props = {
  fileId: string;
};

const props = defineProps<Props>();

const toastStore = useToastStore("layout");

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

const templateSelection = ref<keyof typeof templateSubroutes>();
const subrouteSelection = computed(() =>
  templateSelection.value
    ? templateSubroutes[templateSelection.value]
    : undefined
);

const run = async () => {
  try {
    const { container } = await $apiFetch(
      `/api/container/run/file/${props.fileId}/${subrouteSelection.value}`,
      {
        method: "PUT",
      }
    );
    const { ExclamationCircleIcon } = await import("@heroicons/vue/24/outline");
    toastStore.spawn({
      title: "Started running",
      description: (
        <NuxtLink to={`/container/${container}/logs`}>view logs</NuxtLink>
      ),
      altDescription: `view logs at /container/${container}/logs`,
      icon: <ExclamationCircleIcon />,
    });
  } catch {
    const { ExclamationCircleIcon } = await import("@heroicons/vue/24/outline");
    toastStore.spawn({
      title: "Run Error",
      description: "Cannot run",
      icon: <ExclamationCircleIcon />,
    });
    return;
  }
};
</script>
