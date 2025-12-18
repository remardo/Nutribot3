import { internalMutation } from "./_generated/server";

const DAYS_14_MS = 14 * 24 * 60 * 60 * 1000;
const MAX_DELETES_PER_RUN = 500;

export const deleteOldPhotos = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - DAYS_14_MS;
    let deleted = 0;
    let cursor: string | null = null;

    while (deleted < MAX_DELETES_PER_RUN) {
      const page = await ctx.db
        .query("photoUploads")
        .withIndex("by_createdAt", (q) => q.lt("createdAt", cutoff))
        .paginate({ cursor, numItems: 100 });

      for (const row of page.page) {
        if (deleted >= MAX_DELETES_PER_RUN) break;
        try {
          await ctx.storage.delete(row.storageId as any);
        } catch (e) {
          console.warn("Failed to delete storage object", { storageId: row.storageId, error: String(e) });
        }
        await ctx.db.delete(row._id);
        deleted++;
      }

      if (page.isDone) break;
      cursor = page.continueCursor;
    }

    console.log("deleteOldPhotos finished", { cutoff, deleted });
    return { cutoff, deleted };
  },
});

