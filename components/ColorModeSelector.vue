<template>
  <div class="flex place-content-center place-items-center gap-x-2">
    <UButton
      aria-label="system theme"
      :disabled="$colorMode.preference === 'system'"
      :color="$colorMode.preference === 'system' ? 'black' : 'white'"
      size="xl"
      icon="i-heroicons-device-phone-mobile"
      :ui="{ rounded: 'rounded-full' }"
      @click="$colorMode.preference = 'system'"
    />

    <UButton
      aria-label="light theme"
      :disabled="$colorMode.preference === 'light'"
      :color="$colorMode.preference === 'light' ? 'black' : 'white'"
      size="xl"
      icon="i-heroicons-sun"
      :ui="{ rounded: 'rounded-full' }"
      @click="$colorMode.preference = 'light'"
    />

    <UButton
      aria-label="dark theme"
      :disabled="$colorMode.preference === 'dark'"
      :color="$colorMode.preference === 'dark' ? 'black' : 'white'"
      size="xl"
      icon="i-heroicons-moon"
      :ui="{ rounded: 'rounded-full' }"
      @click="$colorMode.preference = 'dark'"
    />
  </div>
</template>

<script setup lang="ts"></script>
