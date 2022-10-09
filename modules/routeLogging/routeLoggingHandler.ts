import { eventHandler } from "h3";

export default eventHandler((event) => {
  console.log(
    event.req.headers["x-forwarded-for"],
    event.req.method,
    event.req.httpVersion,
    event.req.url
  );
});
