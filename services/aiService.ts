import { ChatMessage, DailyStats } from "../types";
import { convexClient } from "./convexClient";
import { sendMessageToGemini } from "./geminiService";

export const analyzeMeal = async (
  history: ChatMessage[],
  newMessage: string,
  images?: string[],
  currentStats?: DailyStats
): Promise<{ text: string; data: any | null }> => {
  if (!convexClient) {
    // Фолбек, если Convex не настроен
    return sendMessageToGemini(history, newMessage, images, currentStats);
  }

  const client = convexClient as any;
  return client.action("ai:analyzeMeal", {
    history,
    newMessage,
    images,
    currentStats,
  });
};
