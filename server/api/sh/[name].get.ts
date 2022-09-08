import _ from "lodash";
import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  if ((event.context.params.name as string).includes(":")) {
    return {
      status: -1,
    };
  }
  return {
    status: 0,
    value: await useRedis().get(`sh:${event.context.params.name}`),
  };
});
