import path from "path";

export const getFileName = (user: string, name: unknown) => {
  if (typeof name !== "string")
    throw createError({
      statusCode: 500,
      statusMessage: "invalid file name",
    });

  const base = path.resolve(
    useRuntimeConfig().downloadPath ?? "./.dist/files",
    `./${user}`
  );
  const dir = path.resolve(base, name);
  const relative = path.relative(base, dir);

  if (!(relative && !relative.startsWith("..") && !path.isAbsolute(relative)))
    throw createError({
      statusCode: 500,
      statusMessage: "invalid file name",
    });

  return { base, dir };
};
