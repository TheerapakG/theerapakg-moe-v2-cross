export const getSafeIdFromId = (id: string) => id.split(":", 2)[0];
export const getSafeIdFromIdObject = <T = void>(
  idObject: T extends string ? `${T}:${string}` : string
) => (idObject as string).split(":", 2)[1];
