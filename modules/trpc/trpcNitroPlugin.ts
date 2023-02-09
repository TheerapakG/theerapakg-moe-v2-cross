import https from "https";
import { WebSocketServer } from "ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { wsRouter } from "../../trpc/ws/root";
import { createContext } from "../../trpc/ws/context";
import { logger } from "@nuxt/kit";

export default defineNitroPlugin(async () => {
  const ssl = process.env.NITRO_SSL_KEY && process.env.NITRO_SSL_CERT;
  const server = ssl
    ? {
        server: https.createServer({
          key: process.env.NITRO_SSL_KEY,
          cert: process.env.NITRO_SSL_CERT,
        }),
      }
    : undefined;

  const wss = new WebSocketServer({
    port: 3001,
    ...server,
  });

  const handler = applyWSSHandler({ wss, router: wsRouter, createContext });
  handler.broadcastReconnectNotification();

  logger.success(
    `WebSocket server listening on ws${ssl ? "s" : ""}://localhost:3001`
  );
});
