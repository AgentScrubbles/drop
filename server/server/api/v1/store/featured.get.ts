import aclManager from "~/server/internal/acls";
import prisma from "~/server/internal/db/database";
import { getGameVisibilityFilter } from "~/server/internal/utils/gameVisibility";

export default defineEventHandler(async (h3) => {
  const user = await aclManager.getUserACL(h3, ["store:read"]);
  if (!user) throw createError({ statusCode: 403 });

  const visibilityFilter = await getGameVisibilityFilter(user.id, user.admin);

  const games = await prisma.game.findMany({
    where: {
      featured: true,
      ...visibilityFilter,
    },
    select: {
      id: true,
      mName: true,
      mShortDescription: true,
      mCoverObjectId: true,
      mBannerObjectId: true,
      developers: {
        select: {
          id: true,
          mName: true,
        },
      },
      publishers: {
        select: {
          id: true,
          mName: true,
        },
      },
    },
    orderBy: {
      created: "desc",
    },
  });

  return games;
});
