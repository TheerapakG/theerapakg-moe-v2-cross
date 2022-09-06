<template>
  <div
    id="app"
    class="fixed w-screen h-screen bg-white dark:bg-black font-sans text-black dark:text-white overflow-x-hidden overflow-y-auto overscroll-contain"
    :class="{ 'color-mode-change': colorModeChange }"
  >
    <NuxtLayout ref="layout" class="w-full h-full inset-0">
      <div ref="pageContainer" class="w-full h-full">
        <NuxtPage ref="page" class="inset-0 text-center" />
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
