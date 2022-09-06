<template>
  <div class="overflow-x-hidden">
    <div class="absolute inset-0 pt-24 md:pt-8 overflow-x-hidden">
      <NuxtErrorBoundary @error="spawnPageErrorToast">
        <slot ref="pageSlot" />
      </NuxtErrorBoundary>
    </div>
    <div
      class="absolute top-24 md:top-0 bottom-0 md:right-8 w-full md:w-auto flex flex-col justify-end md:justify-start content-center place-items-center pointer-events-none"
    >
      <ToastOverlay class="w-80 h-full" toast-store-id="layout" />
    </div>
    <Transition name="fade">
      <LoadingCircleOverlay v-if="routeStore.navigating" />
    </Transition>
    <button
      v-if="menu?.open"
      class="absolute inset-0 bg-black bg-opacity-50"
      @click="menu?.toggle"
    />
    <SideBar ref="menu" class="absolute top-0 left-0 w-64 h-full">
      <template #content>
        <div
          class="flex flex-col place-content-center place-items-center gap-y-2"
        >
          <div
            v-for="routeInfo in routeInfos"
            :key="routeInfo.fullPath"
            class="flex flex-col place-content-center place-items-center"
          >
            <NuxtLink :to="routeInfo.fullPath">
              {{ routeInfo.routeName }}
            </NuxtLink>
          </div>
          <ColorModeSelector />
          <UserDisplay />
        </div>
      </template>
    </SideBar>
  </div>
</template>

<script setup lang="ts">
const currentRoute = useRoute();
const pageStore = usePageStore();
const routeStore = useRouteStore();
const toastStore = useToastStore("layout");

useHead({
  title: computed(() => `${currentRoute.meta.title}`),
});

const page = ref<HTMLElement>(null);
const menu = ref<InstanceType<typeof SideBar> | null>(null);

const sideBarPaths = ["/", "/github/"];

const routeInfos = computed(() =>
  useMap(sideBarPaths, (path: string) => routeStore.info(path).value)
);

const spawnPageErrorToast = (error) => {
  toastStore.spawn({
    title: "Error loading the page",
    description: "error encountered while loading the page",
  });
  console.log(error);
};

onMounted(() => {
  watchEffect(() => {
    pageStore.pageDom = page.value;
  });
});
</script>
