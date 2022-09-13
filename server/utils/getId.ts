export const getSafeIdFromId = (id: string) => id.split(":", 2)[0];
export const getIdFromIdObject = (idObject: string) =>
  idObject.split(":", 2)[1];
