import { inferAsyncReturnType } from "@trpc/server";
import { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = (opts: CreateWSSContextFnOptions) => {
  return {
    headers: opts.req.headers,
  };
};
export type Context = inferAsyncReturnType<typeof createContext>;
