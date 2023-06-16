import { MeiliSearch } from "meilisearch";
const meili: { [key: string]: MeiliSearch } = {};

export const useMeili = (key: string) => {
  if (!(key in meili)) {
    meili[key] = new MeiliSearch({
      host: "http://127.0.0.1:7700",
      apiKey: key !== "" ? key : undefined,
    });
  }

  return meili[key];
};