
import React, { useMemo } from 'react';
import { MapNode } from '../types';
import { Flag, Tent, Lock, CheckCircle, MapPin, Circle, Star, Camera, Utensils } from 'lucide-react';

interface Props {
  nodes: MapNode[];
  currentIndex: number;
  dailyProgress?: {
      mealsCount: number;
      hasPhoto: boolean;
      hasQuality: boolean;
  };
}

const ExpeditionMap: React.FC<Props> = ({ nodes, currentIndex, dailyProgress }) => {
  
  // Group nodes into weeks (chunks of 7)
  const weeks = useMemo(() => {
      const chunks = [];
      for (let i = 0; i < nodes.length; i += 7) {
          chunks.push(nodes.slice(i, i + 7));
      }
      return chunks;
  }, [nodes]);

  return (
    <div className="w-full">
        {/* Scrollable Map */}
        <div className="w-full overflow-x-auto pb-6 pt-2 no-scrollbar">
        <div className="flex space-x-8 px-2 min-w-max">
            {weeks.map((weekNodes, weekIndex) => (
                <div key={weekIndex} className="bg-gray-900/40 rounded-2xl p-3 border border-gray-700/30 flex flex-col relative">
                    <div className="absolute -top-3 left-3 bg-gray-800 border border-gray-700 text-[10px] text-gray-400 px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">
                        Неделя {weekIndex + 1}
                    </div>
                    
                    <div className="flex items-center space-x-3 mt-2">
                        {weekNodes.map((node, index) => {
                        const globalIndex = weekIndex * 7 + index;
                        const isCamp = node.type === 'camp';
                        const isCompleted = node.status === 'completed';
                        const isCurrent = globalIndex === currentIndex && !isCompleted;
                        // const isLocked = node.status === 'locked' && !isCurrent;
                        
                        return (
                            <div key={node.id} className="relative flex flex-col items-center group">
                            
                            {/* Connector Line (Within Week) */}
                            {index < weekNodes.length - 1 && (
                                <div className={`absolute top-1/2 left-1/2 w-4 h-1 -z-10 ${
                                    isCompleted && weekNodes[index+1].status !== 'locked' ? 'bg-blue-500' : 'bg-gray-700'
                                }`} style={{ width: 'calc(100% + 0.75rem)', transform: 'translateY(-50%)' }}></div>
                            )}
                            
                            {/* Node Icon */}
                            <div className={`
                                relative flex items-center justify-center rounded-full border-2 transition-all duration-300
                                ${isCamp ? 'w-12 h-12' : 'w-10 h-10'}
                                ${isCompleted 
                                    ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                                    : (isCurrent 
                                        ? 'bg-yellow-500 border-yellow-300 text-white animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
                                        : 'bg-gray-800 border-gray-600 text-gray-500')
                                }
                            `}>
                                {isCompleted ? (
                                    <CheckCircle size={isCamp ? 20 : 16} />
                                ) : isCamp ? (
                                    <Tent size={20} />
                                ) : isCurrent ? (
                                    <MapPin size={18} className="fill-current" />
                                ) : (
                                    <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                                )}
                                
                                {/* Current Day Label */}
                                {isCurrent && (
                                    <div className="absolute -top-7 bg-yellow-500 text-gray-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap animate-bounce shadow-lg z-20">
                                        День {node.day}
                                    </div>
                                )}
                            </div>
                            
                            {/* CP10: Daily Progress Indicators (Only for current day) */}
                            {isCurrent && dailyProgress && (
                                <div className="flex gap-1 mt-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${dailyProgress.mealsCount >= 2 ? 'bg-green-400' : 'bg-gray-600'}`} title="2 приема пищи" />
                                    <div className={`w-1.5 h-1.5 rounded-full ${dailyProgress.hasPhoto ? 'bg-green-400' : 'bg-gray-600'}`} title="Фото" />
                                    <div className={`w-1.5 h-1.5 rounded-full ${dailyProgress.hasQuality ? 'bg-green-400' : 'bg-gray-600'}`} title="Качество" />
                                </div>
                            )}

                            {/* Day Number (if not current) */}
                            {!isCurrent && (
                                <div className={`mt-1 text-[9px] font-bold ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {node.day}
                                </div>
                            )}
                            
                            </div>
                        );
                        })}
                    </div>
                </div>
            ))}
            
            {/* End Flag */}
            <div className="flex flex-col items-center justify-center opacity-50 ml-2">
                <Flag size={24} className="text-purple-500" />
            </div>
        </div>
        </div>

        {/* Map Legend */}
        <div className="flex justify-center gap-4 border-t border-gray-700/50 pt-3 flex-wrap px-4">
            <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-blue-400"></div>
                <span className="text-[10px] text-gray-400">Пройдено</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-yellow-300"></div>
                <span className="text-[10px] text-gray-400">Текущий</span>
            </div>
            {dailyProgress && (
                <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
                     <span className="text-[10px] text-gray-500 mr-1">Цели дня:</span>
                     <Utensils size={10} className={dailyProgress.mealsCount >= 2 ? "text-green-400" : "text-gray-600"} />
                     <Camera size={10} className={dailyProgress.hasPhoto ? "text-green-400" : "text-gray-600"} />
                     <Star size={10} className={dailyProgress.hasQuality ? "text-green-400" : "text-gray-600"} />
                </div>
            )}
        </div>
    </div>
  );
};

export default ExpeditionMap;
