<template>
  <div class="overflow-x-hidden">
    <div class="absolute inset-0 overflow-x-hidden overflow-y-visible">
      <div
        class="relative box-border flex min-h-full flex-col place-content-start place-items-center py-24 md:py-8"
      >
        <slot />
      </div>
    </div>
    <div
      class="pointer-events-none absolute top-24 bottom-8 flex w-full flex-col place-items-center content-center justify-end md:top-0 md:bottom-0 md:right-8 md:w-auto md:justify-start"
    >
      <ToastOverlay class="h-full w-80" toast-store-id="layout" />
    </div>
    <Transition name="fade">
      <LoadingCircleOverlay v-if="routeStore.navigating" />
    </Transition>
    <Transition name="fade">
      <button
        v-if="menu?.open"
        class="absolute inset-0 bg-black bg-opacity-50"
        aria-hidden="true"
        @click="menu?.toggle"
      />
    </Transition>
    <nav class="pointer-events-none absolute top-0 left-0 h-full w-64">
      <SideBar ref="menu">
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
    </nav>
  </div>
</template>

<script setup lang="ts">
import SideBar from "~/components/SideBar.vue";
const routeStore = useRouteStore();

useHead({
  title: computed(() => routeStore.title ?? "theerapakg-moe-app"),
});

const menu = ref<InstanceType<typeof SideBar> | null>(null);

const sideBarPaths = ["/", "/github/"];

const routeInfos = computed(() =>
  useMap(sideBarPaths, (path: string) => routeStore.info(path).value)
);
</script>
