import { NitroFetchOptions, NitroFetchRequest } from "nitropack";
import { FetchContext } from "ofetch";

const _apiFetch = () => {
  const tryHandleCommonResponseError = async (ctx: FetchContext) => {
    if (!ctx.response?.ok) {
      if (ctx.response?.statusText === "session expired") {
        if (process.dev) return;

        const userStore = useUserStore();
        await userStore.refreshCurrent();

        await navigateTo("/");

        const toast = useToast();
        toast.add({
          title: "Session Expired",
          description: "Re-login required",
          icon: "i-heroicons-exclaimation-circle",
          actions: [
            {
              label: "go to login",
              click: async () => await navigateTo("/login"),
            },
          ],
          color: "red",
        });
      }
    }
  };

  const config = useRuntimeConfig();

  return $fetch.create({
    headers: useRequestHeaders(["cookie"]) as HeadersInit,
    baseURL: config.public?.apiBaseURL ?? "/",
    onResponseError: tryHandleCommonResponseError,
  });
};

const _useApiFetch = async <
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
  return await useFetch<ResT, ErrorT, ReqT>(request, {
    ...{
      $fetch: _apiFetch(),
    },
    ...opts,
  });
};

export const $apiFetch = async <
  T = unknown,
  R extends NitroFetchRequest = NitroFetchRequest,
  O extends NitroFetchOptions<R> = NitroFetchOptions<R>
>(
  request: R,
  options?: O
) => {
  return await _apiFetch()<T, R, O>(request, options);
};

export const $apiRawFetch = async <
  T = unknown,
  R extends NitroFetchRequest = NitroFetchRequest,
  O extends NitroFetchOptions<R> = NitroFetchOptions<R>
>(
  request: R,
  options?: O
) => {
  return await _apiFetch().raw<T, R, O>(request, options);
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
  return await _useApiFetch<ResT, ErrorT, ReqT>(request, opts);
};
