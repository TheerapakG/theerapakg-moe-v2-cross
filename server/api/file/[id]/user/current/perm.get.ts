import { type } from "arktype";

const paramValidator = type({
  id: "uuid",
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const {
      param: { id },
    } = await validateEvent({ param: paramValidator }, event);

    const [{ perms }] = await checkFilesUserPerm([id], user);

    return perms;
  })
);
