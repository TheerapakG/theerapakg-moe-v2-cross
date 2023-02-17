import { NitroFetchOptions, NitroFetchRequest } from "nitropack";

export const $apiFetch = async <
  T = unknown,
  R extends NitroFetchRequest = NitroFetchRequest,
  O extends NitroFetchOptions<R> = NitroFetchOptions<R>
>(
  request: R,
  options?: O
) => {
  const { $apiFetch } = useNuxtApp();
  return await $apiFetch<T, R, O>(request, options);
};

export const $apiRawFetch = async <
  T = unknown,
  R extends NitroFetchRequest = NitroFetchRequest,
  O extends NitroFetchOptions<R> = NitroFetchOptions<R>
>(
  request: R,
  options?: O
) => {
  const { $apiFetch } = useNuxtApp();
  return await $apiFetch.raw<T, R, O>(request, options);
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
  const { $useApiFetch } = useNuxtApp();
  return await $useApiFetch<ResT, ErrorT, ReqT>(request, opts);
};
