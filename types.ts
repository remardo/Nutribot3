
export interface NutrientData {
  name: string;
  calories: number; // kcal
  protein: number; // g
  fat: number; // g
  carbs: number; // g
  fiber: number; // g
  
  // New specific fields
  omega3: number; // g
  omega6: number; // g
  
  ironTotal: number; // mg
  hemeIron: number; // mg (subset of ironTotal)
  
  // Backward compatibility / UI helpers
  omega3to6Ratio?: string; // Optional now, calculated on frontend preferred
  ironType?: string; // Optional now
  
  importantNutrients: string[]; // List of other vitamins/minerals found
}

export interface PlateRating {
  score: number; // 0-100
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  tags: string[];
  color: string;
}

export interface DailyLogItem extends NutrientData {
  id: string;
  timestamp: number;
  image?: string; // Legacy
  images?: string[]; // New multi-image support
  imageId?: string; // Optional id from storage/legacy
  imageIds?: string[]; // Convex Storage ids (multi)
  note?: string;
  aiAnalysis?: string; // Full text description from AI
  plateRating?: PlateRating; // CP6: Quality Score
  ironHeme?: number;
  ironNonHeme?: number;
}

export interface DayStats {
  date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  omega3: number;
  omega6: number;
  iron: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Legacy
  images?: string[]; // New multi-image support
  imageIds?: string[]; // Convex Storage ids (multi)
  data?: NutrientData;
  timestamp: number;
}

export interface DailyStats {
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  totalFiber: number;
  totalOmega3: number;
  totalOmega6: number;
  totalIron: number;
  totalHemeIron: number;
}

export interface UserGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  omega3: number;
  omega6: number;
  iron: number;
}

// --- GAMIFICATION TYPES ---

export interface Wallet {
    energy: number;
    balance: number;
    mindfulness: number;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    target: number;
    progress: number;
    isCompleted: boolean;
    type: 'daily' | 'weekly' | 'seasonal';
    reward: Partial<Wallet>;
    icon: string;
}

export interface MapNode {
    id: number;
    day: number;
    type: 'path' | 'camp' | 'boss';
    status: 'locked' | 'current' | 'completed' | 'failed';
    rewards?: Partial<Wallet>;
}

export type HabitTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Habit {
    id: string;
    title: string;
    description: string;
    streak: number;
    history: { date: string; status: 'completed' | 'missed' }[];
    tier: HabitTier;
    totalCompletions: number;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string; // Emoji
    color: string; // tailwind text color class
    unlockedAt?: number; // timestamp
}

export interface NotificationSettings {
    enabled: boolean;
    lastSent: string; // Date string to prevent spamming multiple times a day
}

export interface UserProfile {
    name: string;
    avatar?: string;
    totalDaysActive: number;
}

export interface UserGamificationState {
    // Profile (CP11)
    profile: UserProfile;

    // Economy
    wallet: Wallet;
    
    // Level / Rank
    totalExp: number;
    rankId: string;
    
    // Map Progress
    currentSeasonId: string;
    currentDayIndex: number; // 0-27
    mapNodes: MapNode[];
    
    // Quests
    activeQuests: Quest[];
    lastLoginDate: string;
    
    // CP8: Chest
    dailyChestOpened: boolean;

    // Streaks
    streak: {
        current: number;
        best: number;
        lastLogDate: string;
        freezeActive: boolean;
    };

    // Return Strength Mechanic
    returnMechanic: {
        isActive: boolean;
        currentDays: number;
        lastLogDate: string;
    };

    // CP9: Habits
    habits: Habit[];
    
    // Achievements
    unlockedAchievements: string[];

    // CP12: Notifications
    notificationSettings: NotificationSettings;
}

export interface DailyChecklistTask {
    id: string;
    label: string;
    isCompleted: boolean;
}
