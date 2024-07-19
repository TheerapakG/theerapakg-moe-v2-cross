<script setup lang="ts">
type Props = {
  fileId: string;
};

const props = defineProps<Props>();
const { fileId } = toRefs(props);

const wrapper = ref<HTMLElement>();
const video = ref<HTMLAudioElement>();
const control = ref<HTMLElement>();

const { playing, currentTime, duration, volume } = useMediaControls(video, {
  src: computed(() => `/api/file/${fileId.value}/download`),
});

const loop = customRef((track, trigger) => {
  return {
    get: (): boolean => {
      track();
      return video.value?.loop ?? false;
    },
    set: (value: boolean) => {
      if (video.value) video.value.loop = value;
      trigger();
    },
  };
});

const { isFullscreen: fullscreen, enter, exit } = useFullscreen(wrapper);

const updateFullscreen = (value: boolean) => {
  if (value) enter();
  else exit();
};

const controlVisible = useAutoHideVisible(wrapper, control);
</script>

<template>
  <div
    ref="wrapper"
    class="relative"
    :class="{
      'flex flex-col place-content-center place-items-center gap-y-2':
        !fullscreen,
    }"
  >
    <video ref="video" :class="{ 'h-full w-full': fullscreen }" />
    <TransitionFade>
      <MediaControls
        v-if="!fullscreen || controlVisible"
        ref="control"
        v-model:playing="playing"
        v-model:current-time="currentTime"
        v-model:volume="volume"
        v-model:loop="loop"
        class="w-full"
        :class="{ 'absolute bottom-4 px-4': fullscreen }"
        :duration="duration"
        :fullscreen="fullscreen"
        @update:fullscreen="updateFullscreen"
      />
    </TransitionFade>
  </div>
</template>
