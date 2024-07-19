import crypto from "crypto";

export const userDocument = {
  id: crypto.randomUUID(),
  name: "name",
};
