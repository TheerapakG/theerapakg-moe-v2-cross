import { defineStore } from "pinia";
import { MaybeRefOrGetter } from "vue";
import { RouteLocation } from "vue-router";

export interface RouteInfo extends RouteLocation {
  routeName?: string;
}

export const useRouteStore = defineStore("route", () => {
  let currentPath: string | undefined = undefined;
  const navigating = ref(true);
  const currentTitle = shallowRef<MaybeRefOrGetter<string> | undefined>(
    undefined
  );

  const title = computed(() =>
    currentTitle.value ? toValue(currentTitle.value) : undefined
  );

  const setTitle = (newTitle: MaybeRefOrGetter<string> | undefined) => {
    currentTitle.value = newTitle;
    currentPath = useRoute().path;
  };

  watch(navigating, () => {
    const newRoute = useRoute();
    if (currentPath === newRoute.path) return;
    setTitle(newRoute.meta.title);
  });

  const info = (path: MaybeRefOrGetter<string>) => {
    return computed((): RouteInfo => {
      const route = useRouter().resolve(toValue(path));
      if (typeof route.meta.name === "string") {
        return useAssign(
          {
            routeName: route.meta.name,
          },
          route
        );
      } else if (!route.meta.name) {
        return route;
      } else {
        let routeWithData: RouteLocation | null = null;
        useSome(useEntries(route.meta.name), ([name, data]) => {
          if (isEqual(data, route.params)) {
            routeWithData = useAssign(
              {
                routeName: name,
              },
              route
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
