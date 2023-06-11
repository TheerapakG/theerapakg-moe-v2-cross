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
        class="absolute inset-0"
        aria-hidden="true"
        @click="menu?.toggle"
      >
        <InactiveOverlay />
      </button>
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

const sideBarPaths = [
  "/",
  "/github/",
  "/file/list",
  "/container/list",
  "/sh/list",
];

const routeInfos = computed(() =>
  sideBarPaths.map((path: string) => routeStore.info(path).value)
);
const filteredRouteInfos = computed(() => {
  return useCompact(
    routeInfos.value.map((routeInfo) =>
      useRoutePerm(routeInfo).value.havePerm ? routeInfo : undefined
    )
  );
});
const fetchAllRoutePerms = async () => {
  await Promise.all(
    routeInfos.value.map(async (routeInfo) => await fetchRoutePerm(routeInfo))
  );
};
watch(routeInfos, fetchAllRoutePerms);
await fetchAllRoutePerms();

const links = computed(() =>
  filteredRouteInfos.value.map((path: RouteInfo) => {
    return {
      label: path.routeName ?? "<unknown route>",
      to: path.fullPath,
    };
  })
);
</script>
