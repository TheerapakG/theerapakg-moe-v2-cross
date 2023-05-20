<template>
  <div class="flex flex-col place-content-center place-items-center">
    <audio ref="audio" />
    <div
      class="flex w-80 flex-grow flex-col place-content-center place-items-center gap-y-2 overflow-auto"
    >
      <input
        v-model="currentTime"
        class="input-range-default w-full"
        type="range"
        min="0"
        :max="duration"
        step="0.01"
      />
      <div class="flex place-content-center place-items-center gap-x-2">
        <button
          class="button-default flex h-8 w-8 place-content-center place-items-center rounded-full"
          @click="() => (playing ? audio?.pause() : audio?.play())"
        >
          <div class="h-6 w-6">
            <PauseIcon v-if="playing" />
            <PlayIcon v-else />
          </div>
        </button>
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
            <button
              class="button-default flex h-8 w-8 place-content-center place-items-center rounded-full"
              :class="{ activated: showVolumeControl }"
              @click="showVolumeControl = !showVolumeControl"
            >
              <div class="h-6 w-6">
                <SpeakerWaveIcon />
              </div>
            </button>
          </div>
        </div>
        <button
          class="button-default flex h-8 w-8 place-content-center place-items-center rounded-full"
          :class="{ activated: loop }"
          @click="loop = !loop"
        >
          <div class="h-6 w-6">
            <ArrowPathIcon />
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
} from "@heroicons/vue/24/outline";

type Props = {
  fileId: string;
};

const props = defineProps<Props>();

const audio = ref<HTMLAudioElement>();
const { playing, currentTime, duration, volume } = useMediaControls(audio, {
  src: `/api/file/${props.fileId}/download`,
});

const formatDuration = (seconds: number) =>
  new Date(1000 * seconds).toISOString().slice(11, 19);

const showVolumeControl = ref(false);

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
