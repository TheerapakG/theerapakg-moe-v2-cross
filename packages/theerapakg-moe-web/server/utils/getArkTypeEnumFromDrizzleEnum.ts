import type { PgEnum } from "drizzle-orm/pg-core";

type PrependNotEmpty<T extends string> = T extends "" ? "" : `|${T}`;

type ArkTypeEnum<T extends string[]> = T extends [
  infer F extends string,
  ...infer R extends string[],
]
  ? `'${F}'${PrependNotEmpty<ArkTypeEnum<R>>}`
  : "";

export const getArkTypeEnumFromDrizzleEnum = <
  TValues extends [string, ...string[]],
>(
  e: PgEnum<TValues>,
) => {
  return e.enumValues.map((s) => `'${s}'`).join("|") as ArkTypeEnum<TValues>;
};
