import _ from "lodash";
import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  return {
    status: 0,
    value: await useRedis().get(`sh:${event.context.params.name}`),
  };
});
