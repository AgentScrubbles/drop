import { defineClientEventHandler } from "~/server/internal/clients/event-handler";
import userLibraryManager from "~/server/internal/userlibrary";
import { getGameVisibilityFilter } from "~/server/internal/utils/gameVisibility";

export default defineClientEventHandler(async (_h3, { fetchUser }) => {
  const user = await fetchUser();
  const visibilityFilter = await getGameVisibilityFilter(user.id, user.admin);
  const library = await userLibraryManager.fetchLibrary(user.id, visibilityFilter);
  return library.entries.map((e) => e.game);
});
