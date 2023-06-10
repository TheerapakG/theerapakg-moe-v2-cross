import { defu } from "defu";
import {
  AvailableRouterMethod,
  NitroFetchOptions,
  NitroFetchRequest,
  $Fetch,
} from "nitropack";
import { FetchResult, UseFetchOptions } from "nuxt/app";
import { KeysOf } from "nuxt/dist/app/composables/asyncData";
import { FetchContext, FetchError, FetchOptions } from "ofetch";

const _apiFetch = <
  T = unknown,
  R extends NitroFetchRequest = NitroFetchRequest
>(
  defaults: FetchOptions
) => {
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
          color: "red",
        });
      }
    }
  };

  const config = useRuntimeConfig();

  return $fetch.create<T, R>(
    defu(defaults, {
      headers: useRequestHeaders(["cookie"]),
      baseURL: config.public?.apiBaseURL ?? "/",
      onResponseError: tryHandleCommonResponseError,
    })
  );
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const $apiFetch = (<
  T = unknown,
  R extends NitroFetchRequest = NitroFetchRequest,
  O extends NitroFetchOptions<R> = NitroFetchOptions<R>
>(
  request: R,
  options?: O
) => _apiFetch({})<T, R, O>(request, options)) as $Fetch;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
$apiFetch.raw = <
  T = unknown,
  R extends NitroFetchRequest = NitroFetchRequest,
  O extends NitroFetchOptions<R> = NitroFetchOptions<R>
>(
  request: R,
  options?: O
) => _apiFetch({}).raw<T, R, O>(request, options);
$apiFetch.create = _apiFetch;

export const useApiFetch = async <
  ResT = void,
  ErrorT = FetchError,
  ReqT extends NitroFetchRequest = NitroFetchRequest,
  Method extends AvailableRouterMethod<ReqT> = ResT extends void
    ? "get" extends AvailableRouterMethod<ReqT>
      ? "get"
      : AvailableRouterMethod<ReqT>
    : AvailableRouterMethod<ReqT>,
  _ResT = ResT extends void ? FetchResult<ReqT, Method> : ResT,
  DataT = _ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = null
>(
  request: Ref<ReqT> | ReqT | (() => ReqT),
  opts?: UseFetchOptions<_ResT, DataT, PickKeys, DefaultT, ReqT, Method>
) => {
  return await useFetch<
    ResT,
    ErrorT,
    ReqT,
    Method,
    _ResT,
    DataT,
    PickKeys,
    DefaultT
  >(request, {
    ...{
      $fetch: $apiFetch,
    },
    ...opts,
  });
};
