import type { MaybeRefOrGetter } from "vue";
import type { RouteLocation } from "vue-router";

export const fetchRoutePerm = async (route: RouteLocation) => {
  if (!route.meta.perms)
    return {
      requirePerm: false,
      havePerm: true,
    };

  const userPermStore = useUserPermStore();
  const perm = await userPermStore.fetchPerms();

  return {
    requirePerm: true,
    havePerm: route.meta.perms.every(perm),
  };
};

export const useRoutePerm = async (route: MaybeRefOrGetter<RouteLocation>) => {
  const userPermStore = useUserPermStore();
  const perm = await userPermStore.fetchPermsComputed();

  return computed(() => {
    const routeUnref = toValue(route);
    if (!routeUnref.meta.perms)
      return {
        requirePerm: false,
        havePerm: true,
      };

    return {
      requirePerm: true,
      havePerm: routeUnref.meta.perms.every(perm.value),
    };
  });
};
