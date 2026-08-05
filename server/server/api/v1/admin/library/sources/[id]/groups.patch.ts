import { type } from "arktype";
import { readDropValidatedBody, throwingArktype } from "~/server/arktype";
import aclManager from "~/server/internal/acls";
import prisma from "~/server/internal/db/database";

const PatchLibraryGroups = type({
  groupIds: "string[]",
}).configure(throwingArktype);

export default defineEventHandler(async (h3) => {
  const allowed = await aclManager.allowSystemACL(h3, [
    "library:sources:update",
  ]);
  if (!allowed) throw createError({ statusCode: 403 });

  const id = getRouterParam(h3, "id")!;
  const body = await readDropValidatedBody(h3, PatchLibraryGroups);

  const library = await prisma.library.findUnique({ where: { id } });
  if (!library)
    throw createError({
      statusCode: 404,
      message: "Library source not found",
    });

  if (body.groupIds.length > 0) {
    const groups = await prisma.userGroup.findMany({
      where: { id: { in: body.groupIds } },
      select: { id: true },
    });
    if (groups.length !== body.groupIds.length)
      throw createError({
        statusCode: 400,
        message: "One or more group IDs are invalid",
      });
  }

  // updateMany doesn't support relations, so we use update here
  // eslint-disable-next-line drop/no-prisma-delete
  const updated = await prisma.library.update({
    where: { id },
    data: {
      allowedGroups: {
        set: body.groupIds.map((gid) => ({ id: gid })),
      },
    },
    include: {
      allowedGroups: {
        select: { id: true, name: true },
      },
    },
  });

  return updated;
});
