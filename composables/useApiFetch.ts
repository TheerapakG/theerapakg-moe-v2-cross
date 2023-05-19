import { $Fetch, NitroFetchOptions, NitroFetchRequest } from "nitropack";
import { FetchContext } from "ofetch";

let _globalApiFetch: $Fetch<unknown | NitroFetchRequest> | undefined;

const _apiFetch = () => {
  if (_globalApiFetch) return _globalApiFetch;

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

  _globalApiFetch = $fetch.create({
    headers: useRequestHeaders(["cookie"]) as HeadersInit,
    baseURL: config.public?.apiBaseURL ?? "/",
    onResponseError: tryHandleCommonResponseError,
  });

  return _globalApiFetch;
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
