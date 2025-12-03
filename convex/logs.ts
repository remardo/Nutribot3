import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: { userId: v.string() },
  handler: async ({ db }, { userId }) => {
    return await db
      .query("dailyLogs")
      .withIndex("by_user_time", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    userId: v.string(),
    item: v.object({
      name: v.string(),
      calories: v.number(),
      protein: v.number(),
      fat: v.number(),
      carbs: v.number(),
      fiber: v.number(),
      omega3: v.optional(v.number()),
      omega6: v.optional(v.number()),
      ironTotal: v.optional(v.number()),
      hemeIron: v.optional(v.number()),
      ironHeme: v.optional(v.number()),
      ironNonHeme: v.optional(v.number()),
      omega3to6Ratio: v.optional(v.string()),
      ironType: v.optional(v.string()),
      importantNutrients: v.array(v.string()),
      aiAnalysis: v.optional(v.string()),
      plateRating: v.optional(
        v.object({
          score: v.number(),
          grade: v.string(),
          tags: v.array(v.string()),
          color: v.string(),
        })
      ),
      note: v.optional(v.string()),
      image: v.optional(v.string()),
      imageId: v.optional(v.string()),
      images: v.optional(v.array(v.string())),
    }),
  },
  handler: async ({ db }, { userId, item }) => {
    const timestamp = Date.now();
    const ironTotal =
      item.ironTotal ??
      ((item.ironHeme ?? 0) + (item.ironNonHeme ?? 0));
    const hemeIron = item.hemeIron ?? item.ironHeme ?? 0;
    const omega3 = item.omega3 ?? 0;
    const omega6 = item.omega6 ?? 0;
    const _id = await db.insert("dailyLogs", {
      ...item,
      ironTotal,
      hemeIron,
      omega3,
      omega6,
      userId,
      timestamp,
    });
    return { id: _id, ...item, ironTotal, hemeIron, omega3, omega6, timestamp };
  },
});

export const update = mutation({
  args: {
    userId: v.string(),
    id: v.string(),
    updates: v.object({
      note: v.optional(v.string()),
      aiAnalysis: v.optional(v.string()),
      plateRating: v.optional(
        v.object({
          score: v.number(),
          grade: v.string(),
          tags: v.array(v.string()),
          color: v.string(),
        })
      ),
      importantNutrients: v.optional(v.array(v.string())),
      name: v.optional(v.string()),
      calories: v.optional(v.number()),
      protein: v.optional(v.number()),
      fat: v.optional(v.number()),
      carbs: v.optional(v.number()),
      fiber: v.optional(v.number()),
      omega3: v.optional(v.number()),
      omega6: v.optional(v.number()),
      ironTotal: v.optional(v.number()),
      hemeIron: v.optional(v.number()),
      ironHeme: v.optional(v.number()),
      ironNonHeme: v.optional(v.number()),
      image: v.optional(v.string()),
      imageId: v.optional(v.string()),
      images: v.optional(v.array(v.string())),
    }),
  },
  handler: async ({ db }, { userId, id, updates }) => {
    const existing = await db.get(id as any);
    if (!existing || existing.userId !== userId) return null;
    const ironTotal =
      updates.ironTotal ??
      existing.ironTotal ??
      ((updates.ironHeme ?? existing.ironHeme ?? 0) +
        (updates.ironNonHeme ?? existing.ironNonHeme ?? 0));
    const hemeIron =
      updates.hemeIron ??
      updates.ironHeme ??
      existing.hemeIron ??
      existing.ironHeme ??
      0;
    const omega3 = updates.omega3 ?? existing.omega3 ?? 0;
    const omega6 = updates.omega6 ?? existing.omega6 ?? 0;

    await db.patch(id as any, { ...updates, ironTotal, hemeIron, omega3, omega6 } as any);
    const updated = await db.get(id as any);
    if (!updated) return null;
    return { id, ...updated };
  },
});

export const remove = mutation({
  args: { userId: v.string(), id: v.string() },
  handler: async ({ db }, { userId, id }) => {
    const existing = await db.get(id as any);
    if (!existing || existing.userId !== userId) return false;
    await db.delete(id as any);
    return true;
  },
});
