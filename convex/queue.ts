import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { userId: v.string() },
  handler: async ({ db }, { userId }) => {
    return await db
      .query("queue")
      .withIndex("by_user_time", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
  },
});

export const enqueue = mutation({
  args: { userId: v.string(), images: v.array(v.string()) },
  handler: async ({ db }, { userId, images }) => {
    const now = Date.now();
    for (let i = 0; i < images.length; i++) {
      await db.insert("queue", { userId, image: images[i], createdAt: now + i });
    }
    return true;
  },
});

export const pop = mutation({
  args: { userId: v.string() },
  handler: async ({ db }, { userId }) => {
    const next = await db
      .query("queue")
      .withIndex("by_user_time", (q) => q.eq("userId", userId))
      .order("asc")
      .first();
    if (!next) return null;
    await db.delete(next._id);
    return next.image;
  },
});

export const clear = mutation({
  args: { userId: v.string() },
  handler: async ({ db }, { userId }) => {
    const items = await db
      .query("queue")
      .withIndex("by_user_time", (q) => q.eq("userId", userId))
      .collect();
    await Promise.all(items.map((item) => db.delete(item._id)));
    return true;
  },
});
