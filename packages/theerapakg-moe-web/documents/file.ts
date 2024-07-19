import crypto from "crypto";

export const fileDocument = {
  id: crypto.randomUUID(),
  name: "name",
  owner: crypto.randomUUID(),
  created: Date.now(),
  modified: Date.now(),
};
