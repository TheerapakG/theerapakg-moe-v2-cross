import { MeiliSearch } from "meilisearch";
const meili: { [key: string]: MeiliSearch } = {};

export const useMeili = (key: string) => {
  if (!(key in meili)) {
    meili[key] = new MeiliSearch({
      host: "http://127.0.0.1:7700",
      apiKey: key,
    });
  }

  return meili[key];
};

export interface UserDocument {
  id: string;
  name: string;
}

export interface FileDocument {
  id: string;
  name: string;
  owner: string;
}
