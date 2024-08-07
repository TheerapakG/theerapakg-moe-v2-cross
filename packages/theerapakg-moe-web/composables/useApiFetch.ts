import { defu } from "defu";
import type {
  AvailableRouterMethod,
  NitroFetchOptions,
  NitroFetchRequest,
  $Fetch,
} from "nitropack";
import type { FetchResult, UseFetchOptions } from "nuxt/app";
import type { FetchContext, FetchError, FetchOptions } from "ofetch";

type KeysOf<T> = Array<
  T extends T ? (keyof T extends string ? keyof T : never) : never
>;

const $apiFetchCreate = (<
  T = unknown,
  R extends NitroFetchRequest = NitroFetchRequest,
>(
  defaults: FetchOptions,
) => {
  const tryHandleCommonResponseError = async (ctx: FetchContext) => {
    if (!ctx.response?.ok) {
      if (ctx.response?.statusText === "session expired") {
        if (process.server) return;

        const userStore = useUserStore();
        await userStore.fetchCurrent(true);

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
      baseURL: config.public?.apiBaseURL ? config.public.apiBaseURL : "/",
      onResponseError: tryHandleCommonResponseError,
    }),
  );
}) as $Fetch["create"];

export const $apiFetch = (<
  T = unknown,
  R extends NitroFetchRequest = NitroFetchRequest,
  O extends NitroFetchOptions<R> = NitroFetchOptions<R>,
>(
  request: R,
  options?: O,
) => $apiFetchCreate({})<T, R, O>(request, options)) as $Fetch;

const $apiFetchRaw = (<
  T = unknown,
  R extends NitroFetchRequest = NitroFetchRequest,
  O extends NitroFetchOptions<R> = NitroFetchOptions<R>,
>(
  request: R,
  options?: O,
) => $apiFetchCreate({}).raw<T, R, O>(request, options)) as $Fetch["raw"];

$apiFetch.raw = $apiFetchRaw;
$apiFetch.create = $apiFetchCreate;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const useApiFetch = <
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
  DefaultT = null,
>(
  request: Ref<ReqT> | ReqT | (() => ReqT),
  opts?: UseFetchOptions<_ResT, DataT, PickKeys, DefaultT, ReqT, Method>,
) => {
  return useFetch<ResT, ErrorT, ReqT, Method, _ResT, DataT, PickKeys, DefaultT>(
    request,
    defu(opts, {
      $fetch: $apiFetch,
    }),
  );
};
