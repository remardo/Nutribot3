import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const log = mutation({
  args: {
    userId: v.string(),
    type: v.string(),
    payload: v.any(),
  },
  handler: async ({ db }, { userId, type, payload }) => {
    await db.insert("telemetryEvents", {
      userId,
      type,
      payload,
      createdAt: Date.now(),
    });
    return true;
  },
});

export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async ({ db }, { limit }) => {
    const take = Math.min(Math.max(limit ?? 200, 1), 1000);
    return await db
      .query("telemetryEvents")
      .withIndex("by_createdAt")
      .order("desc")
      .take(take);
  },
});
