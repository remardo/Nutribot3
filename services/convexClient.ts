import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = (import.meta as any).env?.VITE_CONVEX_URL;
export const convexClient = CONVEX_URL ? new ConvexHttpClient(CONVEX_URL) : null;

const USER_ID_KEY = "nutribot_user_id";

export const getUserId = (): string => {
  const existing = localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(USER_ID_KEY, id);
  return id;
};

export const ensureConvex = () => {
  if (!convexClient) {
    throw new Error("Convex URL is not configured (set VITE_CONVEX_URL)");
  }
  return convexClient;
};
