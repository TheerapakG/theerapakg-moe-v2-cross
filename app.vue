<template>
  <div
    id="app"
    class="fixed w-screen h-screen bg-white dark:bg-black font-sans text-black dark:text-white overflow-x-hidden overflow-y-auto overscroll-contain"
    :class="{ 'color-mode-change': colorModeChange }"
  >
    <NuxtLayout ref="layout" class="w-full h-full inset-0">
      <NuxtPage ref="page" class="w-full h-full inset-0 text-center" />
      <div id="over-page" class="pointer-events-none absolute inset-0" />
    </NuxtLayout>
    <div id="over-app" class="pointer-events-none absolute inset-0" />
  </div>
</template>

<script setup lang="ts">
const colorModeChange = ref(false);

watch(useColorMode(), () => {
  colorModeChange.value = true;
  setTimeout(() => {
    colorModeChange.value = false;
  }, 300);
});
</script>

<style>
#app.color-mode-change * {
  @apply transition-colors duration-300;
}
</style>
