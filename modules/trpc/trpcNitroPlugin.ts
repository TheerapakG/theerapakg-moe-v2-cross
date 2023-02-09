import http from "http";
import https from "https";
import { WebSocketServer } from "ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { wsRouter } from "../../trpc/ws/root";
import { createContext } from "../../trpc/ws/context";
import { logger } from "@nuxt/kit";

export default defineNitroPlugin(async () => {
  const ssl = process.env.NITRO_SSL_KEY && process.env.NITRO_SSL_CERT;
  const server = ssl
    ? https.createServer({
        key: process.env.NITRO_SSL_KEY,
        cert: process.env.NITRO_SSL_CERT,
      })
    : http.createServer();

  const wss = new WebSocketServer({
    server,
  });

  const handler = applyWSSHandler({ wss, router: wsRouter, createContext });
  server.listen(3001);
  handler.broadcastReconnectNotification();

  let addr = wss.address();
  if (typeof addr != "string") {
    addr = `${addr.address}:${addr.port}`;
  }

  // TODO: check if prod
  console.log(`WebSocket server listening on ${addr}`);
  logger.success(`WebSocket server listening on ${addr}`);
});
