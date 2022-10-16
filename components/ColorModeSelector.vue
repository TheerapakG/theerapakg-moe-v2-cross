<template>
  <div class="flex place-content-center place-items-center gap-x-2">
    <button
      title="system"
      class="system-btn flex h-12 w-12 place-content-center place-items-center rounded-full border-2 border-gray-300 bg-black hover:bg-gray-600 dark:border-gray-600 dark:bg-white dark:hover:bg-gray-300"
      @click="colorMode.preference = 'system'"
    >
      <div class="h-8 w-8">
        <DevicePhoneMobileIcon class="stroke-gray-300 dark:stroke-gray-600" />
      </div>
    </button>

    <button
      title="light"
      class="light-btn flex h-12 w-12 place-content-center place-items-center rounded-full border-2 border-gray-300 bg-black hover:bg-gray-600 dark:border-gray-600 dark:bg-white dark:hover:bg-gray-300"
      @click="colorMode.preference = 'light'"
    >
      <div class="h-8 w-8">
        <SunIcon class="stroke-gray-300 dark:stroke-gray-600" />
      </div>
    </button>

    <button
      title="dark"
      class="dark-btn flex h-12 w-12 place-content-center place-items-center rounded-full border-2 border-gray-300 bg-black hover:bg-gray-600 dark:border-gray-600 dark:bg-white dark:hover:bg-gray-300"
      @click="colorMode.preference = 'dark'"
    >
      <div class="h-8 w-8">
        <MoonIcon class="stroke-gray-300 dark:stroke-gray-600" />
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  DevicePhoneMobileIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/vue/24/outline";
import { useColorMode } from "#imports";

const colorMode = useColorMode();
</script>
