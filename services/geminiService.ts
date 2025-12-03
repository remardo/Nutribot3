
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, DailyStats } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Ты — NutriBot, ИИ-эксперт по нутрициологии. Твоя цель — анализировать еду по фото или текстовому описанию.

Для каждого сообщения пользователя:
1. Определи блюдо/продукты. Если фото несколько, проанализируй ВСЕ блюда на всех фото и дай СУММАРНУЮ оценку.
2. Оцени следующие показатели с высокой точностью (если точных данных нет, дай экспертную оценку):
   - Калории (ккал)
   - Белки (г), Жиры (г), Углеводы (г)
   - Клетчатка (г)
   - Омега-3 (г) и Омега-6 (г). Это важно. Если в продукте их нет, пиши 0.
   - Железо общее (мг) и Железо гемовое (мг). Гемовое - из животных источников. Негемовое - из растительных.
   - Другие важные нутриенты (например, Витамин C, Магний).

3. Отвечай в дружелюбном стиле Telegram-бота на русском языке.
4. ВАЖНО: Добавь JSON блок в самом конце сообщения, обернутый в тройные обратные кавычки.

Формат JSON должен быть строго таким:
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

Примечание: 
- ironTotal = гемовое + негемовое. 
- Если пользователь исправляет данные, пересчитай весь JSON.

Если сообщение не связано с едой, отвечай без JSON.
`;

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string,
  images?: string[],
  currentStats?: DailyStats
): Promise<{ text: string; data: any | null }> => {
  try {
    const model = ai.models;
    
    // Construct prompt history
    let promptText = "";
    if (currentStats) {
        promptText += `[Текущие итоги дня: ${currentStats.totalCalories}ккал, Б:${currentStats.totalProtein}, Ж:${currentStats.totalFat}, У:${currentStats.totalCarbs}]\n`;
    }
    
    const relevantHistory = history.slice(-6); 
    const historyContext = relevantHistory.map(m => `${m.role === 'user' ? 'Пользователь' : 'Бот'}: ${m.text}`).join('\n');
    
    promptText += `${historyContext}\nПользователь: ${newMessage}`;

    const parts: any[] = [{ text: promptText }];

    // Handle multiple images
    if (images && images.length > 0) {
      images.forEach(img => {
        // Handle potential data URI prefix stripping just in case, though usually passed as full base64 string
        const base64Data = img.includes(',') ? img.split(',')[1] : img;
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data
          }
        });
      });
    }

    const response: GenerateContentResponse = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    const text = response.text || "Извините, я не смог это обработать.";
    
    // Extract JSON if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    let extractedData = null;

    if (jsonMatch && jsonMatch[1]) {
      try {
        extractedData = JSON.parse(jsonMatch[1]);
        
        // Safety checks / defaults for new fields if model hallucinates slightly wrong format
        extractedData.omega3 = typeof extractedData.omega3 === 'number' ? extractedData.omega3 : 0;
        extractedData.omega6 = typeof extractedData.omega6 === 'number' ? extractedData.omega6 : 0;
        extractedData.ironTotal = typeof extractedData.ironTotal === 'number' ? extractedData.ironTotal : 0;
        extractedData.hemeIron = typeof extractedData.hemeIron === 'number' ? extractedData.hemeIron : 0;

        // Legacy compatibility helpers
        extractedData.omega3to6Ratio = extractedData.omega6 > 0 
            ? `1:${(extractedData.omega6 / (extractedData.omega3 || 1)).toFixed(1)}` 
            : (extractedData.omega3 > 0 ? "High Omega-3" : "N/A");
            
        const hemePercent = extractedData.ironTotal > 0 ? (extractedData.hemeIron / extractedData.ironTotal) : 0;
        if (hemePercent > 0.8) extractedData.ironType = 'Гемовое';
        else if (hemePercent < 0.2) extractedData.ironType = 'Негемовое';
        else extractedData.ironType = 'Смешанное';

      } catch (e) {
        console.error("Failed to parse JSON from Gemini response", e);
      }
    }

    // Clean text by removing the JSON block to display to user
    const cleanText = text.replace(/```json[\s\S]*?```/, '').trim();

    return {
      text: cleanText,
      data: extractedData
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "Произошла ошибка при анализе. Пожалуйста, проверьте API ключ или попробуйте позже.",
      data: null
    };
  }
};
