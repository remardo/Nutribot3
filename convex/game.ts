import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { userId: v.string() },
  handler: async ({ db }, { userId }) => {
    const doc = await db
      .query("gameStates")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    return doc?.state ?? null;
  },
});

export const save = mutation({
  args: { userId: v.string(), state: v.any() },
  handler: async ({ db }, { userId, state }) => {
    const existing = await db
      .query("gameStates")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) {
      await db.patch(existing._id, { state, updatedAt: Date.now() });
      return state;
    }
    await db.insert("gameStates", { userId, state, updatedAt: Date.now() });
    return state;
  },
});
