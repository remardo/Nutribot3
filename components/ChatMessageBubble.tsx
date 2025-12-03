
import React, { useMemo } from 'react';
import { ChatMessage, NutrientData, PlateRating } from '../types';
import { ChefHat, Database, Star, Flame, Dumbbell, Droplet, Wheat, Leaf, Scale, ShieldAlert, Save } from 'lucide-react';
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

  const cleanText = useMemo(() => {
    if (!message.text) return "";
    return message.text.replace(/```json[\s\S]*?```/gi, "").trim();
  }, [message.text]);

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
          {cleanText || message.text}
        </div>

        {/* Structured Data Card (Bot Only) */}
        {!isUser && message.data && (
          <div className="mt-2 w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 shadow-lg relative overflow-hidden">
            {/* Grade */}
            {rating && (
              <div className="absolute top-3 right-3 bg-gray-900/80 px-3 py-1.5 rounded-xl border border-gray-700 text-xs font-bold flex items-center gap-2 pointer-events-none shadow-lg">
                <span className="text-gray-400 uppercase tracking-wide">Оценка</span>
                <span className={`text-lg ${rating.color}`}>{rating.grade}</span>
                <span className="text-gray-500 font-mono">({rating.score})</span>
              </div>
            )}

            <div className="flex items-start justify-between gap-2 mb-3 pr-28 pt-2">
              <div className="flex items-center gap-2">
                <ChefHat size={16} className="text-green-400" />
                <h3 className="font-bold text-green-400 text-base leading-tight">{message.data.name}</h3>
              </div>
              <div className="bg-gray-900/70 px-3 py-1.5 rounded-xl border border-gray-700 text-xs flex items-center gap-1 text-orange-200">
                <Flame size={14} className="text-orange-400" />
                <span className="font-semibold text-gray-100">{message.data.calories} ккал</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs mb-3">
              <div className="bg-gray-900/70 rounded-xl p-2 flex flex-col items-center gap-1 border border-gray-700/60">
                <Dumbbell size={14} className="text-blue-400" />
                <span className="font-bold text-blue-200 text-sm">{message.data.protein}г</span>
                <span className="text-gray-500">Белки</span>
              </div>
              <div className="bg-gray-900/70 rounded-xl p-2 flex flex-col items-center gap-1 border border-gray-700/60">
                <Droplet size={14} className="text-yellow-400" />
                <span className="font-bold text-yellow-200 text-sm">{message.data.fat}г</span>
                <span className="text-gray-500">Жиры</span>
              </div>
              <div className="bg-gray-900/70 rounded-xl p-2 flex flex-col items-center gap-1 border border-gray-700/60">
                <Wheat size={14} className="text-orange-400" />
                <span className="font-bold text-orange-200 text-sm">{message.data.carbs}г</span>
                <span className="text-gray-500">Угл</span>
              </div>
              <div className="bg-gray-900/70 rounded-xl p-2 flex flex-col items-center gap-1 border border-gray-700/60">
                <Leaf size={14} className="text-green-400" />
                <span className="font-bold text-green-200 text-sm">{message.data.fiber}г</span>
                <span className="text-gray-500">Клетч</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center justify-between bg-gray-900/50 p-2 rounded-lg border border-gray-700/60">
                <div className="flex items-center gap-2 text-gray-400">
                  <Scale size={14} className="text-blue-300" />
                  <span>Омега 3:6</span>
                </div>
                <span className="font-mono text-sm text-gray-100">{formatOmega(message.data)}</span>
              </div>

              <div className="flex items-center justify-between bg-gray-900/50 p-2 rounded-lg border border-gray-700/60">
                <div className="flex items-center gap-2 text-gray-400">
                  <ShieldAlert size={14} className="text-rose-300" />
                  <span>Тип железа</span>
                </div>
                <span className="text-gray-100 capitalize">{formatIron(message.data)}</span>
              </div>
            </div>

            {message.data.importantNutrients.length > 0 && (
              <div className="mt-3">
                <div className="text-[11px] text-gray-400 mb-1">Важные нутриенты:</div>
                <div className="flex flex-wrap gap-1.5">
                  {message.data.importantNutrients.map((n, i) => (
                    <span key={i} className="bg-indigo-900/40 text-indigo-200 px-2 py-1 rounded-full text-[11px] border border-indigo-500/20">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CP6: Quality Tags */}
            {rating && rating.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {rating.tags.map((tag, i) => (
                  <span key={i} className="flex items-center gap-1 text-[10px] bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/20">
                    <Star size={10} className={rating.score > 70 ? "text-yellow-400 fill-yellow-400" : "text-gray-400"} />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {onAddLog && (
              <button
                onClick={() => onAddLog(message.data!, message.text)}
                disabled={isAdded}
                className={`w-full mt-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-md ${
                  isAdded
                    ? 'bg-green-600/20 text-green-400 cursor-default border border-green-500/20 pointer-events-none'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 active:scale-95'
                }`}
              >
                {isAdded ? (
                  <>✓ Сохранено в архив</>
                ) : (
                  <>
                    <Save size={14} /> Сохранить блюдо
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
