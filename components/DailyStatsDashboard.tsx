
import React, { useMemo, useState, useEffect } from 'react';
import { DailyLogItem, DailyStats, DayStats, UserGoals, UserGamificationState, Achievement, Habit, HabitTier } from '../types';
import { initializeOrGetState, getCurrentRank, getNextRank, getHabitTierInfo, getAllAchievementsList } from '../services/gamificationService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';
import { Zap, Scale, Sparkles, Map, Scroll, Check, HelpCircle, Trophy, Lock, Fish, Anchor, X, Plus, Minus, Calendar, Award, Flame, Dumbbell, Droplet, Wheat, Medal } from 'lucide-react';
import ExpeditionMap from './ExpeditionMap';
import QuestBoard from './QuestBoard';
import InfoModal from './InfoModal';
import NutrientProgressBar from './NutrientProgressBar';
import { HelpTopicKey } from '../data/helpTopics';
import { getNutrientStatus, StatusIndicator } from '../utils/nutrientUtils';

interface Props {
  log: DailyLogItem[];
  weeklyData?: DayStats[];
  allLogs?: DailyLogItem[];
  userGoals: UserGoals;
  onUpdateGoal?: (key: keyof UserGoals, delta: number) => void;
}

const COLORS = ['#3b82f6', '#eab308', '#f97316']; 
type PiePropsWithActiveIndex = React.ComponentProps<typeof Pie> & { activeIndex?: number | number[] };

// Custom Tooltip Component for Pie Chart
const CustomPieTooltip = ({ active, payload, total }: any) => {
    if (active && payload && payload.length) {
        const { name, value, fill } = payload[0];
        const percent = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
        return (
            <div className="bg-gray-900/95 border border-gray-700 p-3 rounded-xl shadow-2xl backdrop-blur-sm">
                <p className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: fill }}></span>
                    {name}
                </p>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-white">{value.toFixed(0)}г</span>
                    <span className="text-xs text-gray-400">({percent}%)</span>
                </div>
            </div>
        );
    }
    return null;
};

// Active Shape for Hover Effect
const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    return (
      <g>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} className="drop-shadow-lg transition-all duration-300" />
        <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 8} outerRadius={outerRadius + 10} fill={fill} fillOpacity={0.3} />
      </g>
    );
};

const DailyStatsDashboard: React.FC<Props> = ({ log, weeklyData = [], allLogs = [], userGoals, onUpdateGoal }) => {
  const [gameState, setGameState] = useState<UserGamificationState | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'quests' | 'habits' | 'achievements'>('map');
  const [helpTopic, setHelpTopic] = useState<HelpTopicKey | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [pieActiveIndex, setPieActiveIndex] = useState(-1);

  useEffect(() => {
    let cancelled = false;

    const loadState = async () => {
      const state = await initializeOrGetState();
      if (!cancelled) setGameState(state);
    };

    loadState();

    const interval = setInterval(async () => {
      const updated = await initializeOrGetState();
      if (!cancelled) setGameState(updated);
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [log]);

  const stats: DailyStats = useMemo(() => {
    return log.reduce((acc, item) => ({
      totalCalories: acc.totalCalories + item.calories,
      totalProtein: acc.totalProtein + item.protein,
      totalFat: acc.totalFat + item.fat,
      totalCarbs: acc.totalCarbs + item.carbs,
      totalFiber: acc.totalFiber + item.fiber,
      totalOmega3: acc.totalOmega3 + (item.omega3 || 0),
      totalOmega6: acc.totalOmega6 + (item.omega6 || 0),
      totalIron: acc.totalIron + (item.ironTotal || 0),
      totalHemeIron: acc.totalHemeIron + (item.hemeIron || 0)
    }), {
      totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0, 
      totalFiber: 0, totalOmega3: 0, totalOmega6: 0, totalIron: 0, totalHemeIron: 0
    });
  }, [log]);

  const dailyProgress = useMemo(() => {
      return {
          mealsCount: log.length,
          hasPhoto: log.some(l => (l.images && l.images.length > 0) || l.image),
          hasQuality: log.some(l => l.plateRating && l.plateRating.score > 70)
      };
  }, [log]);

  const macroData = [
    { name: 'Белки', value: stats.totalProtein },
    { name: 'Жиры', value: stats.totalFat },
    { name: 'Углеводы', value: stats.totalCarbs },
  ];
  const totalMacros = stats.totalProtein + stats.totalFat + stats.totalCarbs;
  const nonHemeIron = stats.totalIron - stats.totalHemeIron;
  
  // Calculate Omega Ratio for logic
  const totalOmega = stats.totalOmega3 + stats.totalOmega6;
  const omega3Percent = totalOmega > 0 ? (stats.totalOmega3 / totalOmega) * 100 : 0;
  const omega6Percent = totalOmega > 0 ? (stats.totalOmega6 / totalOmega) * 100 : 0;
  
  const omegaRatioDisplay = stats.totalOmega3 > 0 
    ? (stats.totalOmega6 / stats.totalOmega3).toFixed(1) 
    : (stats.totalOmega6 > 0 ? "∞" : "0");

  // Iron Percent
  const hemePercentOfTotal = userGoals.iron > 0 ? Math.min((stats.totalHemeIron / userGoals.iron) * 100, 100) : 0;
  const nonHemePercentOfTotal = userGoals.iron > 0 ? Math.min((nonHemeIron / userGoals.iron) * 100, 100) : 0;

  const onPieEnter = (_: any, index: number) => {
    setPieActiveIndex(index);
  };

  if (!gameState) return <div className="p-4 text-center">Загрузка экспедиции...</div>;

  const currentRank = getCurrentRank(gameState.totalExp);
  const nextRank = getNextRank(gameState.totalExp);
  const allAchievements = getAllAchievementsList();
  
  let progressPercent = 100;
  let xpForNextLevel = 0;
  if (nextRank) {
      const xpNeeded = nextRank.minExp - currentRank.minExp;
      const xpGained = gameState.totalExp - currentRank.minExp;
      progressPercent = Math.min(100, Math.max(0, (xpGained / xpNeeded) * 100));
      xpForNextLevel = nextRank.minExp;
  }
  
  const omega3Status = getNutrientStatus(stats.totalOmega3, userGoals.omega3);
  const omega6Status = getNutrientStatus(stats.totalOmega6, userGoals.omega6);
  const ironStatus = getNutrientStatus(stats.totalIron, userGoals.iron);

  const pieChartProps: PiePropsWithActiveIndex = {
    data: totalMacros > 0 ? macroData : [{ name: 'Empty', value: 1 }],
    cx: '50%',
    cy: '50%',
    innerRadius: 60,
    outerRadius: 80,
    dataKey: 'value',
    stroke: 'none',
    paddingAngle: 5,
    activeIndex: pieActiveIndex,
    activeShape: renderActiveShape,
    onMouseEnter: onPieEnter,
    isAnimationActive: true,
    animationDuration: 1000,
    animationEasing: 'ease-out',
  };

  const getTierIcon = (tier: HabitTier) => {
      switch(tier) {
          case 'gold': return <Medal size={20} className="text-yellow-400 fill-yellow-400/20" />;
          case 'silver': return <Medal size={20} className="text-gray-300 fill-gray-300/20" />;
          case 'bronze': return <Medal size={20} className="text-amber-700 fill-amber-700/20" />;
          default: return <Medal size={20} className="text-gray-700" />;
      }
  };

  const getAchievementStyles = (colorClass: string, isUnlocked: boolean) => {
    if (!isUnlocked) return 'border-gray-800 bg-gray-900/40 text-gray-600 grayscale opacity-70 border-dashed';
    const map: Record<string, string> = {
        'text-green-400': 'border-green-500/50 bg-green-500/10 shadow-[0_0_15px_rgba(74,222,128,0.2)] text-green-400',
        'text-green-600': 'border-green-600/50 bg-green-600/10 shadow-[0_0_15px_rgba(22,163,74,0.2)] text-green-600',
        'text-orange-500': 'border-orange-500/50 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.2)] text-orange-500',
        'text-purple-400': 'border-purple-400/50 bg-purple-400/10 shadow-[0_0_15px_rgba(192,132,252,0.2)] text-purple-400',
        'text-blue-500': 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)] text-blue-500',
        'text-red-400': 'border-red-500/50 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)] text-red-500',
        'text-cyan-400': 'border-cyan-400/50 bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.2)] text-cyan-400',
        'text-yellow-400': 'border-yellow-200/50 bg-yellow-200/10 shadow-[0_0_15px_rgba(254,240,138,0.2)] text-yellow-200',
        'text-indigo-400': 'border-indigo-400/50 bg-indigo-400/10 shadow-[0_0_15px_rgba(129,140,248,0.2)] text-indigo-400',
    };
    return map[colorClass] || 'border-gray-700 bg-gray-800 text-gray-300';
  };

  return (
    <div className="h-full overflow-y-auto pb-24 p-4 space-y-5 relative bg-gray-900">
      
      <InfoModal topic={helpTopic} onClose={() => setHelpTopic(null)} />
      
      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedAchievement(null)}></div>
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-xs relative border border-gray-700 shadow-2xl animate-fade-in-up">
            <button onClick={() => setSelectedAchievement(null)} className="absolute top-3 right-3 text-gray-400 hover:text-white"><X size={20} /></button>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="text-6xl mb-2 filter drop-shadow-lg scale-125 transition-transform duration-500">{selectedAchievement.icon}</div>
              <div>
                <h3 className={`text-xl font-bold ${selectedAchievement.color}`}>{selectedAchievement.title}</h3>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">{selectedAchievement.description}</p>
              </div>
              {selectedAchievement.unlockedAt ? (
                <div className="bg-green-900/30 border border-green-800/50 text-green-400 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                  <Check size={14} /> Получено: {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
                </div>
              ) : (
                <div className="bg-gray-700/50 border border-gray-600/50 text-gray-400 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                  <Lock size={14} /> Заблокировано
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1. Resource Header (Wallet) */}
      <div className="relative bg-gray-800 rounded-2xl p-4 border border-gray-700 shadow-lg">
         <button onClick={() => setHelpTopic('wallet')} className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"><HelpCircle size={16} /></button>
         <div className="flex justify-between items-center mt-1">
            <div className="flex flex-col items-center w-1/3 border-r border-gray-700/50">
                <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-lg"><Zap size={18} className="fill-yellow-400" />{gameState.wallet.energy}</div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wide">Энергия</span>
            </div>
            <div className="flex flex-col items-center w-1/3 border-r border-gray-700/50">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-lg"><Scale size={18} />{gameState.wallet.balance}</div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wide">Баланс</span>
            </div>
            <div className="flex flex-col items-center w-1/3">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold text-lg"><Sparkles size={18} />{gameState.wallet.mindfulness}</div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wide">Токены</span>
            </div>
         </div>
      </div>

      {/* 2. Rank Banner */}
      <div onClick={() => setHelpTopic('rank')} className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-xl p-4 cursor-pointer hover:bg-blue-900/50 transition-colors group relative overflow-hidden">
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div>
                <div className="text-xs text-blue-300 flex items-center gap-1 mb-1">Текущий ранг <HelpCircle size={10} className="opacity-50" /></div>
                <div className="text-lg font-bold text-white flex items-center gap-2"><Trophy size={18} className="text-yellow-500 fill-yellow-500/20" />{currentRank.title}</div>
            </div>
            <div className="bg-blue-600/20 border border-blue-500/30 text-blue-200 text-xs px-2 py-1 rounded-lg font-mono">Lvl {currentRank.level}</div>
          </div>
          <div className="relative z-10">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5 font-medium"><span>{gameState.totalExp} XP</span><span>{nextRank ? `${xpForNextLevel} XP` : 'MAX'}</span></div>
              <div className="w-full bg-gray-800/50 rounded-full h-2.5 border border-blue-500/20 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-700 ease-out relative" style={{ width: `${progressPercent}%` }}>
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
              </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 3. PERMANENT STATS BLOCK (Always Visible) */}
      <div className="space-y-4">
          
          {/* Macronutrients */}
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
              <h3 className="text-sm font-bold text-gray-300 mb-3">Нутриенты сегодня</h3>
              <NutrientProgressBar label="Калории" value={stats.totalCalories} target={userGoals.calories} color="bg-red-500" icon={<Flame size={12} className="text-red-400"/>} />
              <NutrientProgressBar label="Белки" value={stats.totalProtein} target={userGoals.protein} color="bg-blue-500" icon={<Dumbbell size={12} className="text-blue-400"/>} />
              <NutrientProgressBar label="Жиры" value={stats.totalFat} target={userGoals.fat} color="bg-yellow-500" icon={<Droplet size={12} className="text-yellow-400"/>} />
              <NutrientProgressBar label="Углеводы" value={stats.totalCarbs} target={userGoals.carbs} color="bg-orange-500" icon={<Wheat size={12} className="text-orange-400"/>} />
              <NutrientProgressBar label="Клетчатка" value={stats.totalFiber} target={userGoals.fiber} color="bg-green-500" icon={<Wheat size={12} className="text-green-400"/>} />
          </div>

          {/* Omega & Iron Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Omega 3:6 Composition Card */}
              <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10"><Fish size={64} /></div>
                  <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2"><Fish size={16} className="text-cyan-400" /> Омега 3:6</h3>
                  
                  {/* Big Ratio Display */}
                  <div className="flex justify-between items-end mb-3 relative z-10">
                      <div className="text-3xl font-bold text-white tracking-tighter flex items-baseline gap-1">
                          1:<span className={parseFloat(omegaRatioDisplay) > 5 ? 'text-red-400' : 'text-green-400'}>{omegaRatioDisplay}</span>
                      </div>
                      
                      {/* Interactive Goal Adjuster */}
                      <div className="flex items-center gap-1 bg-gray-900/50 rounded-lg px-2 py-1 border border-gray-700/50">
                          {onUpdateGoal && (<button onClick={() => onUpdateGoal('omega3', -0.1)} className="p-0.5 text-red-400 hover:bg-red-900/30 rounded"><Minus size={10} /></button>)}
                          <span className="text-xs text-gray-400 mx-1">{userGoals.omega3}г</span>
                          {onUpdateGoal && (<button onClick={() => onUpdateGoal('omega3', 0.1)} className="p-0.5 text-green-400 hover:bg-green-900/30 rounded"><Plus size={10} /></button>)}
                      </div>
                  </div>

                  {/* Omega Composition Bar */}
                  <div className="relative h-6 w-full bg-gray-900/80 rounded-full overflow-hidden flex border border-gray-700 mb-2">
                      {totalOmega > 0 ? (
                          <>
                              <div style={{ width: `${omega3Percent}%` }} className="h-full bg-green-500 relative flex items-center justify-start pl-2 transition-all duration-700">
                                  {omega3Percent > 10 && <span className="text-[9px] font-bold text-black/70 whitespace-nowrap">ω-3</span>}
                              </div>
                              <div style={{ width: `${omega6Percent}%` }} className="h-full bg-red-500 relative flex items-center justify-end pr-2 transition-all duration-700">
                                  {omega6Percent > 10 && <span className="text-[9px] font-bold text-white/90 whitespace-nowrap">ω-6</span>}
                              </div>
                          </>
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-600">Нет данных</div>
                      )}
                  </div>
                  
                  {/* Legend / Values */}
                  <div className="flex justify-between text-xs font-mono">
                      <span className="text-green-400">{stats.totalOmega3.toFixed(2)}г</span>
                      <span className="text-red-400">{stats.totalOmega6.toFixed(2)}г</span>
                  </div>
              </div>

              {/* Iron Composition Card */}
              <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10"><Anchor size={64} /></div>
                  <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2"><Anchor size={16} className="text-rose-400" /> Железо</h3>

                  {/* Big Total Display */}
                  <div className="flex justify-between items-end mb-3 relative z-10">
                      <div className={`text-3xl font-bold tracking-tighter ${ironStatus === 'excess' ? 'text-red-400' : (ironStatus === 'met' ? "text-green-400" : "text-white")}`}>
                          {stats.totalIron.toFixed(1)} <span className="text-sm font-normal text-gray-500">мг</span>
                      </div>
                      
                      {/* Interactive Goal Adjuster */}
                      <div className="flex items-center gap-1 bg-gray-900/50 rounded-lg px-2 py-1 border border-gray-700/50">
                          {onUpdateGoal && (<button onClick={() => onUpdateGoal('iron', -1)} className="p-0.5 text-red-400 hover:bg-red-900/30 rounded"><Minus size={10} /></button>)}
                          <span className="text-xs text-gray-400 mx-1">{userGoals.iron} мг</span>
                          {onUpdateGoal && (<button onClick={() => onUpdateGoal('iron', 1)} className="p-0.5 text-green-400 hover:bg-green-900/30 rounded"><Plus size={10} /></button>)}
                      </div>
                  </div>

                  {/* Iron Stacked Bar */}
                  <div className="relative h-6 w-full bg-gray-900/80 rounded-full overflow-hidden flex border border-gray-700 mb-2">
                      <div style={{ width: `${hemePercentOfTotal}%` }} className="h-full bg-rose-500 transition-all duration-700"></div>
                      <div style={{ width: `${nonHemePercentOfTotal}%` }} className="h-full bg-rose-900/60 transition-all duration-700"></div>
                      
                      {/* Goal Marker Line */}
                      <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-white/20 z-10"></div>
                  </div>

                  {/* Legend */}
                  <div className="flex justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                          <span className="text-gray-400">Гемовое</span>
                          <span className="text-gray-200 font-mono ml-1">{stats.totalHemeIron.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-rose-900/60"></div>
                          <span className="text-gray-400">Негемовое</span>
                          <span className="text-gray-200 font-mono ml-1">{nonHemeIron.toFixed(1)}</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 h-64 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie {...pieChartProps}>
                        {totalMacros > 0 ? macroData.map((e, i) => <Cell key={i} fill={COLORS[i]} />) : <Cell fill="#374151" />}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip total={totalMacros} />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
          </div>
      </div>

      {/* 4. Gamification Navigation Tabs */}
      <div className="flex bg-gray-800/50 p-1 rounded-xl overflow-x-auto no-scrollbar gap-1 sticky top-0 z-20 backdrop-blur-md border border-gray-700/30">
          <button onClick={() => setActiveTab('map')} className={`flex-1 min-w-[70px] py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'map' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}><Map size={14} /> Карта</button>
          <button onClick={() => setActiveTab('quests')} className={`flex-1 min-w-[70px] py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'quests' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}><Scroll size={14} /> Квесты</button>
          <button onClick={() => setActiveTab('habits')} className={`flex-1 min-w-[70px] py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'habits' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}><Calendar size={14} /> Привычки</button>
          <button onClick={() => setActiveTab('achievements')} className={`flex-1 min-w-[70px] py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'achievements' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}><Award size={14} /> Награды</button>
      </div>

      {/* 5. Gamification Tab Content */}
      <div className="animate-fade-in-up">
          
          {activeTab === 'map' && (
              <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 relative">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2"><Map size={16} className="text-green-400" /> Сезон Белка: Неделя {Math.ceil((gameState.currentDayIndex + 1) / 7)}</h3>
                      <button onClick={() => setHelpTopic('map')} className="text-gray-500 hover:text-white"><HelpCircle size={16} /></button>
                  </div>
                  <ExpeditionMap nodes={gameState.mapNodes} currentIndex={gameState.currentDayIndex} dailyProgress={dailyProgress} />
                  <div className="mt-4 bg-gray-900/50 p-3 rounded-xl border border-gray-700/50 text-xs text-gray-400"><p>Маршрут обновляется ежедневно. Выполните 3 условия (еда, фото, качество), чтобы закрыть день.</p></div>
              </div>
          )}

          {activeTab === 'quests' && (
              <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 relative">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2"><Scroll size={16} className="text-yellow-400" /> Ежедневные задания</h3>
                      <button onClick={() => setHelpTopic('quests')} className="text-gray-500 hover:text-white"><HelpCircle size={16} /></button>
                  </div>
                  <QuestBoard quests={gameState.activeQuests} />
              </div>
          )}

          {activeTab === 'habits' && (
              <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 relative">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2"><Calendar size={16} className="text-purple-400" /> Привычки</h3>
                      <button onClick={() => setHelpTopic('habits')} className="text-gray-500 hover:text-white"><HelpCircle size={16} /></button>
                  </div>
                  <div className="space-y-3">
                      {gameState.habits.map(habit => {
                          const todayStr = new Date().toDateString();
                          const isDoneToday = habit.history.some(h => h.date === todayStr && h.status === 'completed');
                          const tierInfo = getHabitTierInfo(habit.totalCompletions || 0);
                          return (
                              <div key={habit.id} className="bg-gray-700/30 rounded-xl p-3 border border-gray-700">
                                  <div className="flex justify-between items-start mb-2">
                                      <div>
                                          <h4 className="font-bold text-gray-200 text-sm flex items-center gap-2">{getTierIcon(habit.tier)}{habit.title}{isDoneToday && <Check size={14} className="text-green-500" />}</h4>
                                          <p className="text-xs text-gray-500">{habit.description}</p>
                                      </div>
                                      <div className="flex flex-col items-end"><span className="text-xs font-bold text-orange-400">{habit.streak} дней</span><span className="text-[10px] text-gray-600 uppercase">Стрик</span></div>
                                  </div>
                                  {tierInfo.next && (
                                      <div className="mt-2 mb-3">
                                          <div className="flex justify-between text-[10px] text-gray-400 mb-1"><span>{habit.tier === 'none' ? 'Старт' : habit.tier.toUpperCase()}</span><span>{tierInfo.next.label} ({tierInfo.next.remaining} дн)</span></div>
                                          <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${tierInfo.progress}%` }}></div></div>
                                      </div>
                                  )}
                                  <div className="flex gap-1 justify-end mt-2">
                                      {[...Array(7)].map((_, i) => {
                                          const d = new Date(); d.setDate(d.getDate() - (6 - i));
                                          const dStr = d.toDateString();
                                          const entry = habit.history.find(h => h.date === dStr);
                                          const isToday = dStr === todayStr;
                                          return (<div key={i} className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold ${entry?.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : (isToday ? 'bg-gray-600 text-gray-300 border border-gray-500' : 'bg-gray-800 text-gray-600 border border-gray-700')}`}>{d.getDate()}</div>)
                                      })}
                                  </div>
                              </div>
                          )
                      })}
                  </div>
              </div>
          )}

          {activeTab === 'achievements' && (
              <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 relative">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2"><Award size={16} className="text-pink-400" /> Достижения</h3>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {allAchievements.map(ach => {
                        const isUnlocked = gameState.unlockedAchievements?.includes(ach.id) || false;
                        const dynamicStyle = getAchievementStyles(ach.color, isUnlocked);
                        return (
                            <button key={ach.id} onClick={() => setSelectedAchievement({...ach, unlockedAt: isUnlocked ? Date.now() : undefined})} className={`relative p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 aspect-square group ${dynamicStyle} ${isUnlocked ? 'hover:scale-105 hover:brightness-110' : 'opacity-70'}`}>
                                <div className={`text-3xl drop-shadow-sm transition-transform duration-300 ${isUnlocked ? 'group-hover:scale-110' : 'opacity-50 grayscale'}`}>{ach.icon}</div>
                                <div className={`text-[9px] font-bold text-center leading-tight line-clamp-2 w-full px-1`}>{ach.title}</div>
                                {!isUnlocked && (<div className="absolute top-1.5 right-1.5 bg-gray-900/50 rounded-full p-0.5"><Lock size={10} className="text-gray-400" /></div>)}
                            </button>
                        )
                    })}
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default DailyStatsDashboard;
