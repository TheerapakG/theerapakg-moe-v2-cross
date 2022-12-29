<template>
  <div class="flex place-content-center place-items-center gap-x-2">
    <button
      title="system theme"
      class="system-btn button-default flex h-12 w-12 place-content-center place-items-center rounded-full"
      :class="{ activated: colorMode.preference === 'system' }"
      @click="colorMode.preference = 'system'"
    >
      <div class="h-8 w-8">
        <DevicePhoneMobileIcon />
      </div>
    </button>

    <button
      title="light theme"
      class="light-btn button-default flex h-12 w-12 place-content-center place-items-center rounded-full"
      :class="{ activated: colorMode.preference === 'light' }"
      @click="colorMode.preference = 'light'"
    >
      <div class="h-8 w-8">
        <SunIcon />
      </div>
    </button>

    <button
      title="dark theme"
      class="dark-btn button-default flex h-12 w-12 place-content-center place-items-center rounded-full"
      :class="{ activated: colorMode.preference === 'dark' }"
      @click="colorMode.preference = 'dark'"
    >
      <div class="h-8 w-8">
        <MoonIcon />
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
