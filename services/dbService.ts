import {
  ChatMessage,
  DailyLogItem,
  DayStats,
  UserGamificationState,
  UserGoals,
} from "../types";
import { convexClient, getUserId } from "./convexClient";

const STORAGE_KEY = "nutribot_daily_log";
const CHAT_STORAGE_KEY = "nutribot_chat_history";
const GOALS_STORAGE_KEY = "nutribot_user_goals";
const GAME_STATE_KEY = "nutribot_game_state_v2";
const QUEUE_KEY = "nutribot_processing_queue";

const DEFAULT_GOALS: UserGoals = {
  calories: 2000,
  protein: 120,
  fat: 70,
  carbs: 200,
  fiber: 30,
  omega3: 1.6,
  omega6: 10,
  iron: 14,
};

const useLocalFallback = !convexClient;
const convex = convexClient as any;

// --- Helpers ---

const normalizeLog = (doc: any): DailyLogItem => ({
  id: doc.id ?? doc._id ?? crypto.randomUUID(),
  timestamp: doc.timestamp,
  name: doc.name,
  calories: doc.calories,
  protein: doc.protein,
  fat: doc.fat,
  carbs: doc.carbs,
  fiber: doc.fiber,
  omega3: doc.omega3 ?? 0,
  omega6: doc.omega6 ?? 0,
  ironTotal:
    doc.ironTotal ??
    ((doc.ironHeme ?? 0) + (doc.ironNonHeme ?? 0)),
  hemeIron: doc.hemeIron ?? doc.ironHeme ?? 0,
  ironHeme: doc.ironHeme,
  ironNonHeme: doc.ironNonHeme,
  omega3to6Ratio: doc.omega3to6Ratio,
  ironType: doc.ironType,
  importantNutrients: doc.importantNutrients ?? [],
  aiAnalysis: doc.aiAnalysis,
  plateRating: doc.plateRating,
  note: doc.note,
  image: doc.image ?? doc.imageId,
  imageId: doc.imageId,
  images: doc.images ?? [],
});

const computeLast7DaysStats = (logs: DailyLogItem[]): DayStats[] => {
  const stats: DayStats[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toDateString();

    const dayLogs = logs.filter(
      (item) => new Date(item.timestamp).toDateString() === dateString
    );

    const dayStats = dayLogs.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        fat: acc.fat + item.fat,
        carbs: acc.carbs + item.carbs,
        fiber: acc.fiber + item.fiber,
        omega3: acc.omega3 + (item.omega3 || 0),
        omega6: acc.omega6 + (item.omega6 || 0),
        iron: acc.iron + (item.ironTotal || 0),
      }),
      {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        omega3: 0,
        omega6: 0,
        iron: 0,
      }
    );

    stats.push({
      date: d.toLocaleDateString("ru-RU", { weekday: "short" }),
      ...dayStats,
    });
  }
  return stats;
};

// --- Local fallback implementation (kept so приложение работает без Convex) ---

const getLocalStorageLog = (): DailyLogItem[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const localApi = {
  getAllLogs: (): DailyLogItem[] =>
    getLocalStorageLog().sort((a, b) => b.timestamp - a.timestamp),
  addToDailyLog: (item: Omit<DailyLogItem, "id" | "timestamp">): DailyLogItem => {
    const currentLog = getLocalStorageLog();
    const newItem: DailyLogItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    const updatedLog = [...currentLog, newItem];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLog));
    return newItem;
  },
  updateLogItem: (id: string, updates: Partial<DailyLogItem>): DailyLogItem | null => {
    const currentLog = getLocalStorageLog();
    const updatedLog = currentLog.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLog));
    return updatedLog.find((l) => l.id === id) || null;
  },
  deleteLogItem: (id: string): void => {
    const currentLog = getLocalStorageLog();
    const updatedLog = currentLog.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLog));
  },
  getChatHistory: (): ChatMessage[] => {
    const data = localStorage.getItem(CHAT_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveChatHistory: (messages: ChatMessage[]) => {
    const MAX_HISTORY = 50;
    const messagesToSave = messages.slice(-MAX_HISTORY);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messagesToSave));
    return messagesToSave;
  },
  clearChatHistory: () => localStorage.removeItem(CHAT_STORAGE_KEY),
  getUserGoals: (): UserGoals => {
    const data = localStorage.getItem(GOALS_STORAGE_KEY);
    const storedGoals = data ? JSON.parse(data) : {};
    return { ...DEFAULT_GOALS, ...storedGoals };
  },
  saveUserGoals: (goals: UserGoals) => {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    return goals;
  },
  getGamificationState: (): UserGamificationState | null => {
    const data = localStorage.getItem(GAME_STATE_KEY);
    return data ? JSON.parse(data) : null;
  },
  saveGamificationState: (state: UserGamificationState) => {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
    return state;
  },
  getQueue: (): string[] => {
    const data = localStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  },
  addToQueue: (images: string[]) => {
    const current = localApi.getQueue();
    localStorage.setItem(QUEUE_KEY, JSON.stringify([...current, ...images]));
  },
  popFromQueue: (): string | null => {
    const current = localApi.getQueue();
    if (current.length === 0) return null;
    const item = current.shift();
    localStorage.setItem(QUEUE_KEY, JSON.stringify(current));
    return item || null;
  },
  clearQueue: () => localStorage.removeItem(QUEUE_KEY),
};

// --- Convex-backed API ---

export const getAllLogs = async (): Promise<DailyLogItem[]> => {
  if (useLocalFallback) return localApi.getAllLogs();
  const rows = await convex.query("logs:getAll", { userId: getUserId() });
  return rows.map(normalizeLog);
};

export const addToDailyLog = async (
  item: Omit<DailyLogItem, "id" | "timestamp">
): Promise<DailyLogItem> => {
  if (useLocalFallback) return localApi.addToDailyLog(item);
  const created = await convex.mutation("logs:add", {
    userId: getUserId(),
    item,
  });
  return normalizeLog(created);
};

export const updateLogItem = async (
  id: string,
  updates: Partial<DailyLogItem>
): Promise<DailyLogItem | null> => {
  if (useLocalFallback) return localApi.updateLogItem(id, updates);
  const updated = await convex.mutation("logs:update", {
    userId: getUserId(),
    id,
    updates,
  });
  return updated ? normalizeLog(updated) : null;
};

export const deleteLogItem = async (id: string): Promise<void> => {
  if (useLocalFallback) return localApi.deleteLogItem(id);
  await convex.mutation("logs:remove", { userId: getUserId(), id });
};

export const getLast7DaysStats = (logs: DailyLogItem[]): DayStats[] =>
  computeLast7DaysStats(logs);

export const getChatHistory = async (): Promise<ChatMessage[]> => {
  if (useLocalFallback) return localApi.getChatHistory();
  return await convex.query("chat:get", { userId: getUserId() });
};

export const saveChatHistory = async (
  messages: ChatMessage[]
): Promise<ChatMessage[]> => {
  // Strip heavy image payloads before persisting history (to avoid quota/issues on mobile)
  const compact = messages.map((m) => ({
    ...m,
    image: undefined,
    images: undefined,
  }));

  if (useLocalFallback) return localApi.saveChatHistory(messages);
  return await convex.mutation("chat:save", {
    userId: getUserId(),
    messages: compact,
  });
};

export const clearChatHistory = async (): Promise<void> => {
  if (useLocalFallback) return localApi.clearChatHistory();
  await convex.mutation("chat:clear", { userId: getUserId() });
};

export const getUserGoals = async (): Promise<UserGoals> => {
  if (useLocalFallback) return localApi.getUserGoals();
  const goals = await convex.query("goals:get", { userId: getUserId() });
  return goals ? { ...DEFAULT_GOALS, ...goals } : DEFAULT_GOALS;
};

export const saveUserGoals = async (goals: UserGoals): Promise<UserGoals> => {
  if (useLocalFallback) return localApi.saveUserGoals(goals);
  await convex.mutation("goals:save", { userId: getUserId(), goals });
  return goals;
};

export const getGamificationState = async (): Promise<UserGamificationState | null> => {
  if (useLocalFallback) return localApi.getGamificationState();
  return await convex.query("game:get", { userId: getUserId() });
};

export const saveGamificationState = async (
  state: UserGamificationState
): Promise<UserGamificationState> => {
  if (useLocalFallback) return localApi.saveGamificationState(state);
  await convex.mutation("game:save", { userId: getUserId(), state });
  return state;
};

export const getQueue = async (): Promise<string[]> => {
  if (useLocalFallback) return localApi.getQueue();
  const rows = await convex.query("queue:get", { userId: getUserId() });
  return rows.map((r: any) => r.image);
};

export const addToQueue = async (images: string[]): Promise<void> => {
  if (useLocalFallback) return localApi.addToQueue(images);
  await convex.mutation("queue:enqueue", { userId: getUserId(), images });
};

export const popFromQueue = async (): Promise<string | null> => {
  if (useLocalFallback) return localApi.popFromQueue();
  return await convex.mutation("queue:pop", { userId: getUserId() });
};

export const clearQueue = async (): Promise<void> => {
  if (useLocalFallback) return localApi.clearQueue();
  await convex.mutation("queue:clear", { userId: getUserId() });
};

export const DEFAULT_USER_GOALS = DEFAULT_GOALS;
