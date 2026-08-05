import aclManager from "~/server/internal/acls";
import userLibraryManager from "~/server/internal/userlibrary";
import { getGameVisibilityFilter } from "~/server/internal/utils/gameVisibility";

export default defineEventHandler(async (h3) => {
  const user = await aclManager.getUserACL(h3, ["collections:read"]);
  if (!user)
    throw createError({
      statusCode: 403,
    });

  const visibilityFilter = await getGameVisibilityFilter(user.id, user.admin);
  const collections = await userLibraryManager.fetchCollections(
    user.id,
    visibilityFilter,
  );
  return collections;
});
