<template>
  <div class="flex flex-col place-content-center place-items-center gap-y-2">
    <URange
      :model-value="currentTime"
      class="block"
      :min="0"
      :max="duration"
      :step="0.01"
      @update:model-value="(value) => emit('update:currentTime', value)"
    />
    <div class="flex w-80 place-content-center place-items-center gap-x-2">
      <div class="w-8">
        <UButton
          class="h-8"
          block
          :icon="playing ? 'i-heroicons-pause' : 'i-heroicons-play'"
          :ui="{ rounded: 'rounded-full' }"
          @click="emit('update:playing', !playing)"
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
          <div v-if="showVolumeControl" class="w-24">
            <URange
              :model-value="volume"
              class="block"
              :min="0"
              :max="1"
              :step="0.01"
              @update:model-value="(value) => emit('update:volume', value)"
            />
          </div>
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
          @click="emit('update:loop', !loop)"
        />
      </div>
      <div v-if="fullscreen !== undefined" class="w-8">
        <UButton
          class="h-8"
          block
          :icon="
            fullscreen
              ? 'i-heroicons-arrows-pointing-in'
              : 'i-heroicons-arrows-pointing-out'
          "
          :ui="{ rounded: 'rounded-full' }"
          @click="emit('update:fullscreen', !fullscreen)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  loop: boolean;
  fullscreen?: boolean;
};

defineProps<Props>();

type Emits = {
  "update:playing": [boolean];
  "update:currentTime": [number];
  "update:volume": [number];
  "update:loop": [boolean];
  "update:fullscreen": [boolean];
};

const emit = defineEmits<Emits>();

const formatDuration = (seconds: number) =>
  new Date(1000 * seconds).toISOString().slice(11, 19);

const showVolumeControl = ref(false);
</script>
