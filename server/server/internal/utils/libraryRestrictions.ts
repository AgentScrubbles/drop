import type { Prisma } from "~/prisma/client/client";
import prisma from "~/server/internal/db/database";

export async function getLibraryVisibilityFilter(
  userId: string,
  isAdmin: boolean,
): Promise<Prisma.GameWhereInput | undefined> {
  if (isAdmin) return undefined;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { groups: { select: { id: true } } },
  });
  if (!user) return undefined;

  const userGroupIds = user.groups.map((g) => g.id);

  return {
    library: {
      OR: [
        { allowedGroups: { none: {} } },
        { allowedGroups: { some: { id: { in: userGroupIds } } } },
      ],
    },
  };
}
