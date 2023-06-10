<template>
  <div class="overflow-x-hidden">
    <div class="absolute inset-0 overflow-x-hidden overflow-y-visible">
      <div
        class="relative box-border flex min-h-full flex-col place-content-start place-items-center py-24 md:py-8"
      >
        <slot />
      </div>
    </div>
    <UNotifications />
    <Transition name="fade">
      <LoadingCircleOverlay v-if="routeStore.navigating" />
    </Transition>
    <Transition name="fade">
      <button
        v-if="menu?.open"
        class="absolute inset-0 bg-black bg-opacity-20 dark:bg-white dark:bg-opacity-20"
        aria-hidden="true"
        @click="menu?.toggle"
      />
    </Transition>
    <SideBar
      ref="menu"
      class="pointer-events-none absolute left-0 top-0 h-full w-64"
    >
      <template #content>
        <div
          class="flex flex-col place-content-center place-items-center gap-y-2"
        >
          <UVerticalNavigation
            :ui="{
              wrapper: 'relative w-full',
              base: 'flex w-full border-l',
              rounded: '',
            }"
            :links="links"
          />
          <ColorModeSelector />
          <UserDisplay />
        </div>
      </template>
    </SideBar>
  </div>
</template>

<script setup lang="ts">
import SideBar from "~/components/SideBar.vue";
import { RouteInfo } from "~/stores/route";
const routeStore = useRouteStore();

useHead({
  title: computed(() => routeStore.title ?? "theerapakg-moe-app"),
});

const menu = ref<InstanceType<typeof SideBar> | null>(null);

const sideBarPaths = ["/", "/github/"];

const routeInfos = computed(() =>
  useMap(sideBarPaths, (path: string) => routeStore.info(path).value)
);

const links = computed(() =>
  useMap(routeInfos.value, (path: RouteInfo) => {
    return {
      label: path.routeName ?? "<unknown route>",
      to: path.fullPath,
    };
  })
);
</script>
