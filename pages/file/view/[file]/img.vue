<template>
  <div class="relative flex flex-col place-content-start place-items-center">
    <div
      class="flex w-full flex-grow place-content-center place-items-center overflow-auto"
    >
      <div class="image">
        <img
          :src="`/api/file/${$route.params.file}/download`"
          class="object-none"
        />
      </div>
    </div>
    <div class="absolute bottom-4 flex gap-2">
      <button
        class="dark-btn button-default flex h-12 w-12 place-content-center place-items-center rounded-full"
        @click="factor += 10"
      >
        <div class="h-8 w-8">
          <PlusIcon class="stroke-gray-300 dark:stroke-gray-600" />
        </div>
      </button>
      <button
        class="dark-btn button-default flex h-12 w-12 place-content-center place-items-center rounded-full"
        @click="factor -= 10"
      >
        <div class="h-8 w-8">
          <MinusIcon class="stroke-gray-300 dark:stroke-gray-600" />
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, MinusIcon } from "@heroicons/vue/24/outline";

const factor = ref(100);
const factorStr = computed(() => `${factor.value}%`);
</script>

<style scoped>
.image {
  transform: scale(v-bind(factorStr));
}
</style>
