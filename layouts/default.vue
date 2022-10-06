<template>
  <div class="overflow-x-hidden">
    <div class="absolute inset-0 pt-24 md:pt-8 overflow-x-hidden">
      <NuxtErrorBoundary @error="spawnPageErrorToast">
        <slot />
      </NuxtErrorBoundary>
    </div>
    <div
      class="absolute top-24 md:top-0 bottom-8 md:bottom-0 md:right-8 w-full md:w-auto flex flex-col justify-end md:justify-start content-center place-items-center pointer-events-none"
    >
      <ToastOverlay class="w-80 h-full" toast-store-id="layout" />
    </div>
    <Transition name="fade">
      <LoadingCircleOverlay v-if="routeStore.navigating" />
    </Transition>
    <Transition name="fade">
      <button
        v-if="menu?.open"
        class="absolute inset-0 bg-black bg-opacity-50"
        @click="menu?.toggle"
      />
    </Transition>
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
import SideBar from "~/components/SideBar.vue";
const currentRoute = useRoute();
const router = useRouter();
const routeStore = useRouteStore();
const toastStore = useToastStore("layout");

useHead({
  title: computed(() => `${currentRoute.meta.title}`),
});

const menu = ref<InstanceType<typeof SideBar> | null>(null);

const sideBarPaths = ["/", "/github/"];

const routeInfos = computed(() =>
  useMap(sideBarPaths, (path: string) => routeStore.info(path).value)
);

router.onError((error) => {
  if (!isNuxtError(error)) {
    toastStore.spawn({
      title: "Error routing to page",
      description: "error encountered routing to page",
    });
  } else {
    toastStore.spawn({
      title: "Error routing to page",
      description: `${error.message}`,
    });
  }
  console.log(error);
});

const spawnPageErrorToast = (error) => {
  toastStore.spawn({
    title: "Error loading the page",
    description: "error encountered while loading the page",
  });
  console.log(error);
};
</script>
