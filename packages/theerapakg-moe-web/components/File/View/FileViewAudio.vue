<script setup lang="ts">
type Props = {
  fileId: string;
};

const props = defineProps<Props>();
const { fileId } = toRefs(props);

const fileStore = useFileStore();

const { data: fileInfo } = await useAsyncData(
  () => fileStore.fetchFile(fileId.value),
  {
    watch: [fileId],
  },
);

const audio = ref<HTMLAudioElement>();
const { playing, currentTime, duration, volume } = useMediaControls(audio, {
  src: computed(() => fileInfo.value?.url ?? ""),
});

const loop = customRef((track, trigger) => {
  return {
    get: (): boolean => {
      track();
      return audio.value?.loop ?? false;
    },
    set: (value: boolean) => {
      if (audio.value) audio.value.loop = value;
      trigger();
    },
  };
});
</script>

<template>
  <div
    class="relative flex flex-col place-content-center place-items-center gap-y-2"
  >
    <audio ref="audio" />
    <MediaControls
      v-model:playing="playing"
      v-model:current-time="currentTime"
      v-model:volume="volume"
      v-model:loop="loop"
      :duration="duration"
    />
  </div>
</template>
