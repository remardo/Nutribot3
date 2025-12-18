import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  dailyLogs: defineTable({
    userId: v.optional(v.string()),
    timestamp: v.number(),
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
    importantNutrients: v.optional(v.array(v.string())),
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
    imageIds: v.optional(v.array(v.string())),
  })
    .index("by_user_time", ["userId", "timestamp"])
    .index("by_user_name", ["userId", "name"]),

  chatHistories: defineTable({
    userId: v.string(),
    messages: v.array(
      v.object({
        id: v.string(),
        role: v.union(v.literal("user"), v.literal("model")),
        text: v.string(),
        timestamp: v.number(),
        image: v.optional(v.string()),
        images: v.optional(v.array(v.string())),
        imageIds: v.optional(v.array(v.string())),
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
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  userGoals: defineTable({
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
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  gameStates: defineTable({
    userId: v.string(),
    state: v.any(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  queue: defineTable({
    userId: v.string(),
    image: v.string(),
    createdAt: v.number(),
  }).index("by_user_time", ["userId", "createdAt"]),

  photoUploads: defineTable({
    userId: v.string(),
    storageId: v.string(),
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_storageId", ["storageId"]),
});
