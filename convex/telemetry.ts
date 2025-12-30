import { mutation } from "./_generated/server";
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
