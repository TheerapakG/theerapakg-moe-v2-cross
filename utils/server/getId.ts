export const getSafeIdFromId = (id: string | undefined) =>
  (id && id.split(":").pop()) ?? "";
export const getSafeIdFromIdObject = <T = void>(
  idObject: T extends string ? `${T}:${string}` : string
) => (idObject as string).split(":").pop() ?? "";
