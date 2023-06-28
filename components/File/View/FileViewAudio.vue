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

<script setup lang="ts">
type Props = {
  fileId: string;
};

const props = defineProps<Props>();
const { fileId } = toRefs(props);

const audio = ref<HTMLAudioElement>();
const { playing, currentTime, duration, volume } = useMediaControls(audio, {
  src: computed(() => `/api/file/${fileId.value}/download`),
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
