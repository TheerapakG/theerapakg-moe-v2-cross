import path from "path";

export const getFileName = (user: string, name: string) => {
  const parsedName = path.parse(name).base;
  return { name: parsedName, dir: `/${user}/${parsedName}` };
};
