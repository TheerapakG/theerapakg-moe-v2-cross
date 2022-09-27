import { NitroFetchRequest } from "nitropack";
import { FetchContext, FetchOptions } from "ohmyfetch";
import { Ref } from "vue";

const tryHandleCommonResponseError = async (ctx: FetchContext) => {
  if (!ctx.response.ok) {
    if (ctx.response.statusText === "session expired") {
      const userStore = useUserStore();
      await userStore.refreshCurrent();

      await navigateTo("/");

      const { ExclamationCircleIcon } = await import("@heroicons/vue/outline");
      const toastStore = useToastStore("layout");
      toastStore.spawn({
        title: "Session Expired",
        description: "Re-login required",
        icon: h(ExclamationCircleIcon),
        actions: {
          login: {
            title: "go to login",
            action: () => navigateTo("/login"),
          },
        },
      });
    }
  }
};

export const $apiFetch = async <
  T = unknown,
  R extends NitroFetchRequest = NitroFetchRequest
>(
  request: R,
  opts?: FetchOptions
) => {
  const config = useRuntimeConfig();
  return await $fetch<T, R>(request, {
    ...{
      headers: useRequestHeaders(["cookie"]),
      baseURL: config.public?.apiBaseURL ?? "/",
      onResponseError: tryHandleCommonResponseError,
    },
    ...opts,
  });
};

export const useApiFetch = async <
  ResT = void,
  ErrorT = Error,
  ReqT extends NitroFetchRequest = NitroFetchRequest,
  OptsT extends Parameters<typeof useFetch<ResT, ErrorT, ReqT>>[1] = Parameters<
    typeof useFetch<ResT, ErrorT, ReqT>
  >[1]
>(
  request: Ref<ReqT> | ReqT | (() => ReqT),
  opts?: OptsT
) => {
  const config = useRuntimeConfig();

  return await useFetch<ResT, ErrorT, ReqT>(request, {
    ...{
      headers: useRequestHeaders(["cookie"]),
      baseURL: config.public?.apiBaseURL ?? "/",
      onResponseError: tryHandleCommonResponseError,
    },
    ...opts,
  });
};
