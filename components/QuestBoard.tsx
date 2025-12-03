
import React from 'react';
import { Quest } from '../types';
import { CheckCircle2, Circle, Zap, Scale, Sparkles, Camera, Dumbbell, Carrot, Droplet } from 'lucide-react';

interface Props {
  quests: Quest[];
}

const QuestBoard: React.FC<Props> = ({ quests }) => {
  
  const getIcon = (iconName: string) => {
      switch(iconName) {
          case 'camera': return <Camera size={16} />;
          case 'dumbbell': return <Dumbbell size={16} />;
          case 'carrot': return <Carrot size={16} />;
          case 'droplet': return <Droplet size={16} />;
          default: return <Sparkles size={16} />;
      }
  };

  return (
    <div className="space-y-3">
      {quests.map(quest => (
        <div 
            key={quest.id} 
            className={`flex items-center p-3 rounded-xl border transition-all ${
                quest.isCompleted 
                ? 'bg-green-900/20 border-green-500/30' 
                : 'bg-gray-800 border-gray-700'
            }`}
        >
          {/* Icon Box */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
              quest.isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
          }`}>
              {getIcon(quest.icon)}
          </div>
          
          <div className="flex-1">
              <div className="flex justify-between items-start">
                  <h4 className={`text-sm font-bold ${quest.isCompleted ? 'text-gray-300 line-through' : 'text-white'}`}>
                      {quest.title}
                  </h4>
                  {/* Rewards Pills */}
                  <div className="flex gap-1">
                      {quest.reward.energy && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/20">
                              <Zap size={8} /> +{quest.reward.energy}
                          </span>
                      )}
                      {quest.reward.balance && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                              <Scale size={8} /> +{quest.reward.balance}
                          </span>
                      )}
                  </div>
              </div>
              <p className="text-xs text-gray-400 leading-tight mt-0.5">{quest.description}</p>
              
              {/* Progress Bar */}
              <div className="mt-2 w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${quest.isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                  ></div>
              </div>
              <div className="text-[10px] text-right text-gray-500 mt-0.5">
                  {quest.progress} / {quest.target}
              </div>
          </div>
          
          <div className="ml-3">
              {quest.isCompleted ? (
                  <CheckCircle2 size={24} className="text-green-500" />
              ) : (
                  <Circle size={24} className="text-gray-600" />
              )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestBoard;
