import { MaybeRef } from "vue";
import { RouteLocationNormalized } from "vue-router";

export const fetchRoutePerm = async (route: RouteLocationNormalized) => {
  if (!route.meta.perms)
    return {
      requirePerm: false,
      havePerm: true,
    };

  const permStore = usePermStore();
  const perms = await permStore.fetchPerms();

  return {
    requirePerm: true,
    havePerm: route.meta.perms.every((perm) => perms.includes(perm)),
  };
};

export const useRoutePerm = (route: MaybeRef<RouteLocationNormalized>) => {
  return computed(() => {
    const routeUnref = unref(route);
    if (!routeUnref.meta.perms)
      return {
        requirePerm: false,
        havePerm: true,
      };

    const permStore = usePermStore();
    const permValues = routeUnref.meta.perms.map((perm) =>
      permStore.perm(perm)
    );

    return {
      requirePerm: true,
      havePerm: permValues.every((permValue) => permValue),
    };
  });
};
