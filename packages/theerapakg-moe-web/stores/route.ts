import { defineStore } from "pinia";
import type { MaybeRefOrGetter } from "vue";
import type { RouteLocationResolvedGeneric } from "vue-router";

export interface RouteInfo extends RouteLocationResolvedGeneric {
  routeName?: string;
}

export const useRouteStore = defineStore("route", () => {
  const navigating = ref(true);
  const currentTitle = shallowRef<MaybeRefOrGetter<string> | undefined>(
    undefined,
  );

  const title = computed(() =>
    currentTitle.value ? toValue(currentTitle.value) : undefined,
  );

  const setTitle = (newTitle: MaybeRefOrGetter<string> | undefined) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    currentTitle.value = newTitle;
  };

  const { currentRoute } = useRouter();

  watch(currentRoute, () => {
    setTitle(currentRoute.value.meta.title);
  });

  const info = (path: MaybeRefOrGetter<string>) => {
    return computed((): RouteInfo => {
      const route = useRouter().resolve(toValue(path));
      if (typeof route.meta.name === "string") {
        return useAssign(
          {
            routeName: route.meta.name,
          },
          route,
        );
      } else if (!route.meta.name) {
        return route;
      } else {
        let routeWithData: RouteLocationResolvedGeneric | null = null;
        useSome(useEntries(route.meta.name), ([name, data]) => {
          if (isEqual(data, route.params)) {
            routeWithData = useAssign(
              {
                routeName: name,
              },
              route,
            );
            return true;
          }
        });
        return routeWithData ?? route;
      }
    });
  };

  return {
    navigating,
    title,
    setTitle,
    info,
  };
});
