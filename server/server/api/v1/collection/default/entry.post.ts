import aclManager from "~/server/internal/acls";
import prisma from "~/server/internal/db/database";
import userLibraryManager from "~/server/internal/userlibrary";
import { getGameVisibilityFilter } from "~/server/internal/utils/gameVisibility";

export default defineEventHandler(async (h3) => {
  const user = await aclManager.getUserACL(h3, ["library:add"]);
  if (!user)
    throw createError({
      statusCode: 403,
      statusMessage: "Requires authentication",
    });

  const body = await readBody(h3);
  const gameId = body.id;
  if (!gameId)
    throw createError({ statusCode: 400, statusMessage: "Game ID required" });

  const visibilityFilter = await getGameVisibilityFilter(user.id, user.admin);
  if (visibilityFilter) {
    const allowed = await prisma.game.count({
      where: { id: gameId, ...visibilityFilter },
    });
    if (allowed === 0)
      throw createError({ statusCode: 404, statusMessage: "Game not found" });
  }

  // Add the game to the default collection
  await userLibraryManager.libraryAdd(gameId, user.id);
  return {};
});
