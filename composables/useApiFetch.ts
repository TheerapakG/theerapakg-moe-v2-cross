import { NitroFetchRequest } from "nitropack";
import { FetchOptions, FetchRequest } from "ofetch";

interface ResponseMap {
  blob: Blob;
  text: string;
  arrayBuffer: ArrayBuffer;
  stream: ReadableStream<Uint8Array>;
}
type ResponseType = keyof ResponseMap | "json";

export const $apiFetch = async <T = unknown, R extends ResponseType = "json">(
  request: FetchRequest,
  options?: FetchOptions<R>
) => {
  const { $apiFetch } = useNuxtApp();
  return await $apiFetch<T, R>(request, options);
};

export const $apiRawFetch = async <
  T = unknown,
  R extends ResponseType = "json"
>(
  request: FetchRequest,
  options?: FetchOptions<R>
) => {
  const { $apiFetch } = useNuxtApp();
  return await $apiFetch.raw<T, R>(request, options);
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
