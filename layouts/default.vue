<script setup lang="ts">
import SideBar from "~/components/SideBar.vue";
import type { RouteInfo } from "~/stores/route";

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
  sideBarPaths.map((path: string) => routeStore.info(path)),
);

const routePerms = await useAsyncRefMap(routeInfos, async (routeInfo) => {
  const perm = await useRoutePerm(routeInfo);
  return computed(() => {
    return {
      route: toValue(routeInfo),
      perm: perm.value,
    };
  });
});

const filteredRouteInfos = computed(() =>
  useCompact(
    routePerms.value.map((routePerm) => {
      const { route, perm } = routePerm.value;
      return perm.havePerm ? route : undefined;
    }),
  ),
);

const links = computed(() =>
  filteredRouteInfos.value.map((path: RouteInfo) => {
    return {
      label: path.routeName ?? "<unknown route>",
      to: path.fullPath,
    };
  }),
);
</script>

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
    <TransitionFade>
      <LoadingCircleOverlay v-if="routeStore.navigating" />
    </TransitionFade>
    <TransitionFade>
      <button
        v-if="menu?.open"
        class="absolute inset-0"
        aria-hidden="true"
        @click="menu?.toggle"
      >
        <InactiveOverlay />
      </button>
    </TransitionFade>
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
