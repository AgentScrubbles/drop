import type { Prisma } from "~/prisma/client/client";
import { getAgeRestrictionFilter } from "./ageRestrictions";
import { getLibraryVisibilityFilter } from "./libraryRestrictions";

export async function getGameVisibilityFilter(
  userId: string,
  isAdmin: boolean,
): Promise<Prisma.GameWhereInput | undefined> {
  const ageFilter = await getAgeRestrictionFilter(userId, isAdmin);
  const libraryFilter = await getLibraryVisibilityFilter(userId, isAdmin);

  if (!ageFilter && !libraryFilter) return undefined;

  return {
    ...ageFilter,
    ...libraryFilter,
  };
}
