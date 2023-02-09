import {
  type CreateTRPCClientOptions,
  type inferRouterProxyClient,
  createTRPCProxyClient,
  createWSClient,
  wsLink,
} from "@trpc/client";
import { type AnyRouter } from "@trpc/server";
import { createFlatProxy, createRecursiveProxy } from "@trpc/server/shared";
import { hash } from "ohash";
import { createTRPCNuxtClient as _createTRPCNuxtClient } from "trpc-nuxt/client";
import type { WsRouter } from "~/trpc/ws/root";

// BEGIN: trpc-nuxt/client

const getQueryKey = (path: string, input: unknown) => {
  return input === undefined ? path : `${path}-${hash(input || "")}`;
};

const createNuxtProxyDecoration = <TRouter extends AnyRouter>(
  name: string,
  client: inferRouterProxyClient<TRouter>
) => {
  return createRecursiveProxy((opts) => {
    const args = opts.args;

    const pathCopy = [name, ...opts.path];

    // The last arg is for instance `.useMutation` or `.useQuery()`
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lastArg = pathCopy.pop()!;

    // The `path` ends up being something like `post.byId`
    const path = pathCopy.join(".");

    const [input, otherOptions] = args;

    if (lastArg === "useQuery") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { trpc, ...asyncDataOptions } = otherOptions || ({} as any);

      let controller: AbortController;

      if (trpc?.abortOnUnmount) {
        if (getCurrentInstance()) {
          onScopeDispose(() => {
            controller?.abort?.();
          });
        }
        controller =
          typeof AbortController !== "undefined"
            ? new AbortController()
            : ({} as AbortController);
      }

      const queryKey = getQueryKey(path, input);
      return useAsyncData(
        queryKey,
        () =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (client as any)[path].query(input, {
            signal: controller?.signal,
            ...trpc,
          }),
        asyncDataOptions
      );
    } // PATCH BEGIN
    else if (lastArg == "subscribe") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (client as any)[path][lastArg](input, otherOptions);
    } // PATCH END

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (client as any)[path][lastArg](input);
  });
};

const createTRPCNuxtClient = <TRouter extends AnyRouter>(
  opts: CreateTRPCClientOptions<TRouter>
) => {
  const client = createTRPCProxyClient<TRouter>(opts);

  const decoratedClient = createFlatProxy((key) => {
    return createNuxtProxyDecoration(key, client);
    // PATCH BEGIN
  }) as ReturnType<typeof _createTRPCNuxtClient<TRouter>>; //PATCH END

  return decoratedClient;
};

// END: trpc-nuxt/client

let wsClient: ReturnType<typeof createTRPCNuxtClient<WsRouter>> | undefined =
  undefined;

export const useTRPCWs = () => {
  const config = useRuntimeConfig();

  if (!wsClient) {
    wsClient = createTRPCNuxtClient<WsRouter>({
      links: [
        wsLink({
          client: createWSClient({
            url: `${
              config?.public?.wsHost === ""
                ? "ws://localhost:3001"
                : config?.public?.wsHost
            }`,
          }),
        }),
      ],
    });
  }
  return wsClient;
};
