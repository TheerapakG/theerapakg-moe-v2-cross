<template>
  <div class="flex flex-col place-content-center place-items-center gap-y-2">
    <video ref="video" />
    <div
      class="flex w-full flex-col place-content-center place-items-center gap-y-2"
    >
      <input
        v-model="currentTime"
        class="input-range-default w-full"
        type="range"
        min="0"
        :max="duration"
        step="0.01"
      />
      <div class="flex w-80 place-content-center place-items-center gap-x-2">
        <div class="w-8">
          <UButton
            class="h-8"
            block
            :icon="playing ? 'i-heroicons-pause' : 'i-heroicons-play'"
            :ui="{ rounded: 'rounded-full' }"
            @click="() => (playing ? video?.pause() : video?.play())"
          />
        </div>
        <div class="min-w-[10rem]">
          {{ formatDuration(currentTime) }} / {{ formatDuration(duration) }}
        </div>
        <div class="relative h-10 w-10">
          <div
            class="absolute inset-y-0 right-0 flex place-content-center place-items-center gap-x-2 p-1"
            :class="{
              'rounded-full bg-black pl-4 dark:bg-white': showVolumeControl,
            }"
          >
            <input
              v-if="showVolumeControl"
              v-model="volume"
              class="input-range-default"
              type="range"
              min="0"
              max="1"
              step="0.01"
            />
            <div class="w-8">
              <UButton
                class="h-8"
                block
                :color="showVolumeControl ? 'black' : 'white'"
                icon="i-heroicons-speaker-wave"
                :ui="{ rounded: 'rounded-full' }"
                @click="showVolumeControl = !showVolumeControl"
              />
            </div>
          </div>
        </div>
        <div class="w-8">
          <UButton
            class="h-8"
            block
            :color="loop ? 'black' : 'white'"
            icon="i-heroicons-arrow-path"
            :ui="{ rounded: 'rounded-full' }"
            @click="loop = !loop"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  fileId: string;
};

const props = defineProps<Props>();
const { fileId } = toRefs(props);

const video = ref<HTMLAudioElement>();
const { playing, currentTime, duration, volume } = useMediaControls(video, {
  src: computed(() => `/api/file/${fileId.value}/download`),
});

const formatDuration = (seconds: number) =>
  new Date(1000 * seconds).toISOString().slice(11, 19);

const showVolumeControl = ref(false);

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
</script>
