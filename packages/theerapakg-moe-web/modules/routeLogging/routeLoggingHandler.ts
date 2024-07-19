import { eventHandler } from "h3";
import { getClientIp } from "request-ip";

export default eventHandler((event) => {
  const ip = getClientIp(event.req);
  const method = getMethod(event);
  console.log(ip, method, event.req.httpVersion, event.req.url);
});
