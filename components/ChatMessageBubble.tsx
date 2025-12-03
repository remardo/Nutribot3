
import React, { useMemo } from 'react';
import { ChatMessage, NutrientData, PlateRating } from '../types';
import { ChefHat, Database, Star, Tag } from 'lucide-react';
import { calculatePlateRating } from '../services/gamificationService';

interface Props {
  message: ChatMessage;
  onAddLog?: (data: NutrientData, aiText?: string) => void | Promise<void>;
  isAdded?: boolean;
}

const ChatMessageBubble: React.FC<Props> = ({ message, onAddLog, isAdded }) => {
  const isUser = message.role === 'user';

  // Calculate rating on the fly for preview if not saved yet
  // In a real app we might want to pass user goals, but for preview defaults are okay
  const rating: PlateRating | null = useMemo(() => {
      if (!message.data) return null;
      return calculatePlateRating(message.data);
  }, [message.data]);

  // Support both legacy single image and new array of images
  const imagesToDisplay = message.images && message.images.length > 0 
    ? message.images 
    : (message.image ? [message.image] : []);

  const formatOmega = (data: NutrientData) => {
    // If we have specific values
    if ((data.omega3 || 0) > 0 || (data.omega6 || 0) > 0) {
        return (
            <div className="flex flex-col items-end">
                <span className="text-white font-mono text-xs">
                    ω-3: {data.omega3?.toFixed(2)}g
                </span>
                <span className="text-gray-400 font-mono text-[10px]">
                    ω-6: {data.omega6?.toFixed(2)}g
                </span>
            </div>
        );
    }
    // Fallback to old string format
    const ratio = data.omega3to6Ratio || 'N/A';
    if (ratio.includes('Low') || ratio.includes('High')) {
      return <span className="text-indigo-300 text-[11px]">{ratio}</span>;
    }
    return <span className="text-white font-mono text-xs">{ratio}</span>;
  };

  const formatIron = (data: NutrientData) => {
      // If we have numeric iron
      if ((data.ironTotal || 0) > 0) {
          return (
             <div className="flex flex-col items-end">
                <span className="text-white font-mono text-xs">
                    {data.ironTotal?.toFixed(1)} mg
                </span>
                <span className="text-[10px] text-gray-400">
                    {data.hemeIron ? `Heme: ${((data.hemeIron/data.ironTotal)*100).toFixed(0)}%` : data.ironType}
                </span>
             </div>
          )
      }
      return <span className="text-white">{data.ironType}</span>;
  }

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
      <div className={`flex max-w-[90%] md:max-w-[75%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Message Bubble */}
        <div
          className={`p-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700'
          }`}
        >
          {imagesToDisplay.length > 0 && (
            <div className={`mb-2 grid gap-1.5 ${imagesToDisplay.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {imagesToDisplay.map((img, idx) => (
                <img 
                  key={idx}
                  src={img} 
                  alt={`Upload ${idx + 1}`} 
                  className={`rounded-lg object-cover w-full border border-gray-600 ${imagesToDisplay.length > 1 ? 'aspect-square' : 'max-h-64'}`} 
                />
              ))}
            </div>
          )}
          {message.text}
        </div>

        {/* Structured Data Card (Bot Only) */}
        {!isUser && message.data && (
          <div className="mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl p-3 shadow-lg relative overflow-hidden">
            
            {/* CP6: Grade Badge */}
            {rating && (
                <div className="absolute top-0 right-0 bg-gray-900/80 backdrop-blur-sm border-l border-b border-gray-700 rounded-bl-xl px-3 py-1.5 flex items-center gap-2 z-10">
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Оценка</div>
                    <div className={`text-lg font-black ${rating.color} drop-shadow-md`}>{rating.grade}</div>
                    <div className="text-xs text-gray-500 font-mono">({rating.score})</div>
                </div>
            )}

            <div className="flex justify-between items-start mb-2 pr-24">
              <h3 className="font-bold text-green-400 flex items-center gap-2">
                <ChefHat size={16} />
                {message.data.name}
              </h3>
            </div>
            
            {/* Calories Badge */}
            <div className="inline-block bg-gray-700/50 px-2 py-0.5 rounded text-gray-300 text-xs mb-3 border border-gray-600/30">
                 {message.data.calories} ккал
            </div>

            {/* Macros Grid */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3">
              <div className="bg-gray-900/50 p-1 rounded">
                <div className="text-blue-400 font-bold">{message.data.protein}g</div>
                <div className="text-gray-500">Белки</div>
              </div>
              <div className="bg-gray-900/50 p-1 rounded">
                <div className="text-yellow-400 font-bold">{message.data.fat}g</div>
                <div className="text-gray-500">Жиры</div>
              </div>
              <div className="bg-gray-900/50 p-1 rounded">
                <div className="text-orange-400 font-bold">{message.data.carbs}g</div>
                <div className="text-gray-500">Угл</div>
              </div>
              <div className="bg-gray-900/50 p-1 rounded">
                <div className="text-green-500 font-bold">{message.data.fiber}g</div>
                <div className="text-gray-500">Клетч</div>
              </div>
            </div>

            {/* CP6: Quality Tags */}
            {rating && rating.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {rating.tags.map((tag, i) => (
                        <span key={i} className="flex items-center gap-1 text-[10px] bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/20">
                            <Star size={8} className={rating.score > 70 ? "text-yellow-400 fill-yellow-400" : "text-gray-400"} />
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="text-xs text-gray-400 space-y-1 mb-3 bg-gray-900/30 p-2 rounded-lg">
               <div className="flex justify-between items-center border-b border-gray-700/50 pb-1">
                 <span>Омега 3:6</span>
                 {formatOmega(message.data)}
               </div>
               <div className="flex justify-between items-center pt-1">
                 <span>Профиль железа</span>
                 {formatIron(message.data)}
               </div>
            </div>
            
            {message.data.importantNutrients.length > 0 && (
                 <div className="mb-3">
                   <div className="flex flex-wrap gap-1">
                     {message.data.importantNutrients.map((n, i) => (
                       <span key={i} className="bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded text-[10px]">
                         {n}
                       </span>
                     ))}
                   </div>
                 </div>
            )}

            {onAddLog && (
              <button
                onClick={() => onAddLog(message.data!, message.text)}
                disabled={isAdded}
                className={`w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                  isAdded
                    ? 'bg-green-600/20 text-green-400 cursor-default border border-green-500/20'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                }`}
              >
                {isAdded ? (
                  <>✓ Добавлено в Дневник</>
                ) : (
                  <>
                    <Database size={14} /> Добавить запись (+XP)
                  </>
                )}
              </button>
            )}
          </div>
        )}

        <div className="text-[10px] text-gray-500 mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessageBubble;
