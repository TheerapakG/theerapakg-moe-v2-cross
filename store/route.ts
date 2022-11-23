import { defineStore } from "pinia";
import { Ref } from "vue";
import { RouteLocation } from "vue-router";

export interface RouteInfo extends RouteLocation {
  routeName?: string;
}

export const useRouteStore = defineStore("route", () => {
  const navigating = ref(true);

  const info = (path: string | Ref<string>) => {
    return computed((): RouteInfo => {
      const unrefPath = unref(path);
      const route = useRouter().resolve(unrefPath);
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
    info,
  };
});
