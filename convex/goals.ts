import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { userId: v.string() },
  handler: async ({ db }, { userId }) => {
    const doc = await db
      .query("userGoals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    return doc?.goals ?? null;
  },
});

export const save = mutation({
  args: {
    userId: v.string(),
    goals: v.object({
      calories: v.number(),
      protein: v.number(),
      fat: v.number(),
      carbs: v.number(),
      fiber: v.number(),
      omega3: v.number(),
      omega6: v.number(),
      iron: v.number(),
    }),
  },
  handler: async ({ db }, { userId, goals }) => {
    const existing = await db
      .query("userGoals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) {
      await db.patch(existing._id, { goals, updatedAt: Date.now() });
      return goals;
    }
    await db.insert("userGoals", { userId, goals, updatedAt: Date.now() });
    return goals;
  },
});
