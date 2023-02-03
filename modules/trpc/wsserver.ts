import https from "https";
import { WebSocketServer } from "ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { wsRouter } from "../../trpc/ws/root";
import { createContext } from "../../trpc/ws/context";
import consola from "consola";

const logger = consola.withScope("nuxt:trpc");
const nitro = useNitroApp();

const wss = new WebSocketServer({
  port: 3001,
  ...(process.env.NITRO_SSL_KEY &&
    process.env.NITRO_SSL_CERT && {
      server: https.createServer({
        key: process.env.NITRO_SSL_KEY,
        cert: process.env.NITRO_SSL_CERT,
      }),
    }),
});

const handler = applyWSSHandler({ wss, router: wsRouter, createContext });

logger.success("WebSocket Server listening on ws://localhost:3001");
nitro.hooks.hook("close", () => {
  logger.log("Closing WebSocket Server...");
  handler.broadcastReconnectNotification();
  wss.close();
});
