import { type } from "arktype";
import { MeiliSearch } from "meilisearch";
const meili: { [key: string]: MeiliSearch } = {};

export const useMeili = (key: string) => {
  if (!(key in meili)) {
    const config = useRuntimeConfig();
    meili[key] = new MeiliSearch({
      host: `http://127.0.0.1:${
        type("number | parsedInteger")(config.meiliPort)?.data ?? 7700
      }`,
      apiKey: key !== "" ? key : undefined,
    });
  }

  return meili[key];
};
