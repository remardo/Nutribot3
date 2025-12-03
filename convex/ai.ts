import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

const SYSTEM_PROMPT = `
Ты - NutriBot, ИИ-эксперт по нутрициологии. Твоя цель - анализировать еду по фото или текстовому описанию.

Для каждого сообщения пользователя:
1. Определи блюдо/продукты. Если фото несколько, проанализируй ВСЕ блюда на всех фото и дай СУММАРНУЮ оценку.
2. Оцени следующие показатели с высокой точностью (если точных данных нет, дай экспертную оценку):
   - Калории (ккал)
   - Белки (г), Жиры (г), Углеводы (г)
   - Клетчатка (г)
   - Омега-3 (г) и Омега-6 (г). Если их нет, пиши 0.
   - Железо общее (мг) и Железо гемовое (мг). Негемовое = общее - гемовое.
   - Другие важные нутриенты (например, Витамин C, Магний).
3. Отвечай в дружелюбном стиле Telegram-бота на русском языке.
4. ВАЖНО: Добавь JSON блок в самом конце сообщения, обернутый в тройные обратные кавычки.

Формат JSON:
\`\`\`json
{
  "name": "Стейк лосося с рисом",
  "calories": 450,
  "protein": 35,
  "fat": 20,
  "carbs": 45,
  "fiber": 2.5,
  "omega3": 1.5,
  "omega6": 0.5,
  "ironTotal": 1.2,
  "hemeIron": 0.4,
  "importantNutrients": ["Витамин D", "Селен"]
}
\`\`\`

Если сообщение не связано с едой, отвечай без JSON.
`;

const MODEL = process.env.OPENAI_MODEL || "gpt-4.1";

export const analyzeMeal = action({
  args: {
    history: v.array(
      v.object({
        id: v.string(),
        role: v.union(v.literal("user"), v.literal("model")),
        text: v.string(),
        timestamp: v.number(),
        image: v.optional(v.string()),
        images: v.optional(v.array(v.string())),
        data: v.optional(v.any()),
      })
    ),
    newMessage: v.string(),
    images: v.optional(v.array(v.string())),
    currentStats: v.optional(
      v.object({
        totalCalories: v.number(),
        totalProtein: v.number(),
        totalFat: v.number(),
        totalCarbs: v.number(),
        totalFiber: v.number(),
        totalOmega3: v.number(),
        totalOmega6: v.number(),
        totalIron: v.number(),
        totalHemeIron: v.number(),
      })
    ),
  },
  handler: async (_ctx, { history, newMessage, images = [], currentStats }) => {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const statsText = currentStats
      ? `[Текущие итоги дня: ${currentStats.totalCalories}ккал, Б:${currentStats.totalProtein}, Ж:${currentStats.totalFat}, У:${currentStats.totalCarbs}]`
      : "";

    const relevantHistory = history.slice(-6);
    const historyText = relevantHistory
      .map((m) => `${m.role === "user" ? "Пользователь" : "Бот"}: ${m.text}`)
      .join("\n");

    const userContent: any[] = [
      {
        type: "text",
        text: `${statsText}\n${historyText}\nПользователь: ${newMessage}`,
      },
    ];

    for (const img of images) {
      const base64 = img.includes(",") ? img.split(",")[1] : img;
      userContent.push({
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${base64}` },
      });
    }

    const response = await client.chat.completions.create({
      model: MODEL,
      // Некоторые модели (например gpt-4.1/gpt-5) не поддерживают custom temperature — оставляем дефолт.
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    });

    const text =
      response.choices[0]?.message?.content ||
      "Извините, я не смог это обработать.";

    const jsonMatch = text.match(/```json\\n([\\s\\S]*?)\\n```/);
    let extractedData: any = null;

    if (jsonMatch && jsonMatch[1]) {
      try {
        extractedData = JSON.parse(jsonMatch[1]);
        extractedData.omega3 = typeof extractedData.omega3 === "number" ? extractedData.omega3 : 0;
        extractedData.omega6 = typeof extractedData.omega6 === "number" ? extractedData.omega6 : 0;
        extractedData.ironTotal = typeof extractedData.ironTotal === "number" ? extractedData.ironTotal : 0;
        extractedData.hemeIron = typeof extractedData.hemeIron === "number" ? extractedData.hemeIron : 0;
        extractedData.omega3to6Ratio =
          extractedData.omega6 > 0
            ? `1:${(extractedData.omega6 / (extractedData.omega3 || 1)).toFixed(1)}`
            : extractedData.omega3 > 0
            ? "High Omega-3"
            : "N/A";
        const hemePercent =
          extractedData.ironTotal > 0
            ? extractedData.hemeIron / extractedData.ironTotal
            : 0;
        if (hemePercent > 0.8) extractedData.ironType = "Гемовое";
        else if (hemePercent < 0.2) extractedData.ironType = "Негемовое";
        else extractedData.ironType = "Смешанное";
      } catch (err) {
        console.error("Failed to parse JSON from OpenAI response", err);
      }
    }

    const cleanText = text.replace(/```json[\\s\\S]*?```/, "").trim();

    return { text: cleanText, data: extractedData };
  },
});
