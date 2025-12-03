import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { userId: v.string() },
  handler: async ({ db }, { userId }) => {
    const doc = await db
      .query("chatHistories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    return doc?.messages ?? [];
  },
});

export const save = mutation({
  args: {
    userId: v.string(),
    messages: v.array(
      v.object({
        id: v.string(),
        role: v.union(v.literal("user"), v.literal("model")),
        text: v.string(),
        timestamp: v.number(),
        image: v.optional(v.string()),
        images: v.optional(v.array(v.string())),
        data: v.optional(
          v.union(
            v.null(),
            v.object({
              name: v.string(),
              calories: v.number(),
              protein: v.number(),
              fat: v.number(),
              carbs: v.number(),
              fiber: v.number(),
              omega3: v.number(),
              omega6: v.number(),
              ironTotal: v.number(),
              hemeIron: v.number(),
              omega3to6Ratio: v.optional(v.string()),
              ironType: v.optional(v.string()),
              importantNutrients: v.array(v.string()),
            })
          )
        ),
      })
    ),
  },
  handler: async ({ db }, { userId, messages }) => {
    const trimmed = messages.slice(-50);
    const existing = await db
      .query("chatHistories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) {
      await db.patch(existing._id, { messages: trimmed, updatedAt: Date.now() });
      return trimmed;
    }
    await db.insert("chatHistories", {
      userId,
      messages: trimmed,
      updatedAt: Date.now(),
    });
    return trimmed;
  },
});

export const clear = mutation({
  args: { userId: v.string() },
  handler: async ({ db }, { userId }) => {
    const existing = await db
      .query("chatHistories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) {
      await db.patch(existing._id, { messages: [], updatedAt: Date.now() });
    }
    return true;
  },
});
