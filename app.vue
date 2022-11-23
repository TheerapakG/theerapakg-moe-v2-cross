<template>
  <div
    id="app"
    class="fixed h-screen w-screen overflow-y-auto overflow-x-hidden overscroll-contain bg-white font-sans text-black dark:bg-black dark:text-white"
    :class="{ 'color-mode-change': colorModeChange }"
  >
    <NuxtLayout ref="layout">
      <div
        ref="pageContainer"
        class="flex w-full flex-shrink-0 flex-grow flex-col place-content-start place-items-center"
      >
        <NuxtPage
          ref="page"
          class="w-full flex-shrink-0 flex-grow text-center"
        />
      </div>
      <div class="pointer-events-none absolute inset-0">
        <portal-target name="over-page" />
      </div>
    </NuxtLayout>
    <div class="pointer-events-none absolute inset-0">
      <portal-target name="over-app" />
    </div>
  </div>
</template>

<script setup lang="ts">
const pageStore = usePageStore();

const colorModeChange = ref(false);
const pageContainer = ref<HTMLDivElement | null>(null);

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
