import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async ({ storage }) => {
    return await storage.generateUploadUrl();
  },
});

export const getUrl = query({
  args: { storageId: v.string() },
  handler: async ({ storage }, { storageId }) => {
    return await storage.getUrl(storageId as any);
  },
});

export const getUrls = query({
  args: { storageIds: v.array(v.string()) },
  handler: async ({ storage }, { storageIds }) => {
    const entries = await Promise.all(
      storageIds.map(async (id) => [id, await storage.getUrl(id as any)] as const)
    );
    return Object.fromEntries(entries);
  },
});

export const recordUpload = mutation({
  args: { userId: v.string(), storageId: v.string() },
  handler: async ({ db }, { userId, storageId }) => {
    const existing = await db
      .query("photoUploads")
      .withIndex("by_storageId", (q) => q.eq("storageId", storageId))
      .first();
    if (existing) return existing._id;

    const _id = await db.insert("photoUploads", {
      userId,
      storageId,
      createdAt: Date.now(),
    });
    return _id;
  },
});
