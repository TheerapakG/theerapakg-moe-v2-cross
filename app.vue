<template>
  <div
    id="app"
    class="fixed h-screen w-screen overflow-y-auto overflow-x-hidden overscroll-contain bg-white font-sans text-black dark:bg-black dark:text-white"
    :class="{ 'color-mode-change': colorModeChange }"
  >
    <NuxtLayout ref="layout" class="inset-0 h-full w-full">
      <div ref="pageContainer" class="h-0 min-h-full w-full">
        <NuxtPage ref="page" class="text-center" />
        <div id="over-page" class="pointer-events-none absolute inset-0" />
      </div>
    </NuxtLayout>
    <div id="over-app" class="pointer-events-none absolute inset-0" />
  </div>
</template>

<script setup lang="ts">
const pageStore = usePageStore();

const colorModeChange = ref(false);
const pageContainer = ref<HTMLDivElement>(null);

watch(useColorMode(), () => {
  colorModeChange.value = true;
  setTimeout(() => {
    colorModeChange.value = false;
  }, 300);
});

onMounted(() => {
  const updatePageContainer = () => {
    pageStore.pageContainerDom = pageContainer.value;
  };
  updatePageContainer();
  watch(pageContainer, updatePageContainer);
});
</script>

<style>
#app.color-mode-change * {
  @apply transition-colors duration-300;
}
</style>
