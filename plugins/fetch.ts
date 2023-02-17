import { NitroFetchRequest } from "nitropack";
import { FetchContext } from "ofetch";
import { Ref } from "vue";

export default defineNuxtPlugin(() => {
  const tryHandleCommonResponseError = async (ctx: FetchContext) => {
    if (!ctx.response?.ok) {
      if (ctx.response?.statusText === "session expired") {
        const userStore = useUserStore();
        await userStore.refreshCurrent();

        await navigateTo("/");

        const { ExclamationCircleIcon } = await import(
          "@heroicons/vue/24/outline"
        );
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
  const config = useRuntimeConfig();

  const apiFetch = $fetch.create({
    headers: useRequestHeaders(["cookie"]) as HeadersInit,
    baseURL: config.public?.apiBaseURL ?? "/",
    onResponseError: tryHandleCommonResponseError,
  });

  const useApiFetch = async <
    ResT = void,
    ErrorT = Error,
    ReqT extends NitroFetchRequest = NitroFetchRequest,
    OptsT extends Parameters<
      typeof useFetch<ResT, ErrorT, ReqT>
    >[1] = Parameters<typeof useFetch<ResT, ErrorT, ReqT>>[1]
  >(
    request: Ref<ReqT> | ReqT | (() => ReqT),
    opts?: OptsT
  ) => {
    return await useFetch<ResT, ErrorT, ReqT>(request, {
      ...{
        $fetch: apiFetch,
      },
      ...opts,
    });
  };

  return {
    provide: {
      apiFetch,
      useApiFetch,
    },
  };
});
