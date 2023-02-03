import { router } from "./trpc";
import { containerRouter } from "./routers/container";

export const wsRouter = router({
  container: containerRouter,
});
// export type definition of API
export type WsRouter = typeof wsRouter;
