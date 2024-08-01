import path from "path";

export const getFileName = (name: string) => {
  const parsedName = path.parse(name).base;
  return { name: parsedName };
};
