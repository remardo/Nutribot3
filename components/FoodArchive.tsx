
import React, { useMemo, useState } from 'react';
import { DailyLogItem } from '../types';
import { Calendar, Trash2, Clock, Flame, Dumbbell, Droplet, Wheat, Search, X, Filter, Download, MessageSquare, Check, Edit2, ChevronDown, ChevronUp, Info, Fish, Anchor } from 'lucide-react';

interface Props {
  logs: DailyLogItem[];
  onDelete: (id: string) => void | Promise<void>;
  onUpdate: (id: string, updates: Partial<DailyLogItem>) => void | Promise<void>;
}

const FoodArchive: React.FC<Props> = ({ logs, onDelete, onUpdate }) => {
  const [filterDate, setFilterDate] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    if (!filterDate) return logs;
    return logs.filter(item => {
      const d = new Date(item.timestamp);
      // Format as YYYY-MM-DD for comparison with input type="date" value
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      return dateStr === filterDate;
    });
  }, [logs, filterDate]);

  const groupedLogs = useMemo(() => {
    const groups: Record<string, DailyLogItem[]> = {};
    
    // Sort logs descending by timestamp before grouping
    const sorted = [...filteredLogs].sort((a, b) => b.timestamp - a.timestamp);

    sorted.forEach(item => {
      const date = new Date(item.timestamp).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });
    
    return groups;
  }, [filteredLogs]);

  const dates = Object.keys(groupedLogs);
  
  // Calculate summary for the current view
  const summary = useMemo(() => {
    return filteredLogs.reduce((acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        fat: acc.fat + item.fat,
        carbs: acc.carbs + item.carbs,
        fiber: acc.fiber + (item.fiber || 0)
    }), { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 });
  }, [filteredLogs]);

  const handleExport = () => {
    if (filteredLogs.length === 0) return;

    // CSV Headers
    const headers = [
        "Дата", 
        "Время", 
        "Название", 
        "Калории (ккал)", 
        "Белки (г)", 
        "Жиры (г)", 
        "Углеводы (г)", 
        "Клетчатка (г)",
        "Омега-3 (г)",
        "Омега-6 (г)",
        "Железо (мг)",
        "Гемовое Железо (мг)",
        "Примечание",
        "Анализ ИИ"
    ];

    // Map data to CSV rows
    const rows = filteredLogs.map(item => {
        const dateObj = new Date(item.timestamp);
        const date = dateObj.toLocaleDateString('ru-RU');
        const time = dateObj.toLocaleTimeString('ru-RU');
        
        // Escape quotes in name to prevent CSV issues
        const safeName = `"${item.name.replace(/"/g, '""')}"`; 
        const safeNote = item.note ? `"${item.note.replace(/"/g, '""')}"` : "";
        const safeAI = item.aiAnalysis ? `"${item.aiAnalysis.replace(/"/g, '""').replace(/\n/g, ' ')}"` : "";

        return [
            date,
            time,
            safeName,
            item.calories,
            item.protein,
            item.fat,
            item.carbs,
            item.fiber,
            item.omega3 || 0,
            item.omega6 || 0,
            item.ironTotal || 0,
            item.hemeIron || 0,
            safeNote,
            safeAI
        ].join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Add BOM (Byte Order Mark) so Excel opens UTF-8 Cyrillic correctly
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nutribot_export_${filterDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startEditing = (id: string, currentNote?: string) => {
    setEditingId(id);
    setNoteText(currentNote || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNoteText('');
  };

  const saveNote = (id: string) => {
    onUpdate(id, { note: noteText });
    setEditingId(null);
    setNoteText('');
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }

  return (
    <div className="h-full overflow-y-auto pb-24 p-4 space-y-4 bg-gray-900">
      <div className="flex items-center justify-between mb-2">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                <Calendar size={20} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Архив блюд</h2>
                <div className="text-xs text-gray-400">История питания</div>
            </div>
         </div>
         
         <button
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
            className={`p-2.5 rounded-lg border transition-colors flex items-center gap-2 ${
                filteredLogs.length === 0 
                ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed' 
                : 'bg-gray-800 border-gray-600 text-blue-400 hover:bg-gray-700 hover:text-white hover:border-blue-500 shadow-sm'
            }`}
            title="Экспорт в CSV"
         >
            <Download size={20} />
            <span className="hidden sm:inline text-sm font-medium">Экспорт</span>
         </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 shadow-sm">
        <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-300 font-medium">Фильтр по дате:</span>
        </div>
        <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
                <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 [color-scheme:dark]"
                />
            </div>
            {filterDate && (
                <button 
                    onClick={() => setFilterDate('')}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
                    title="Сбросить фильтр"
                >
                    <X size={18} />
                </button>
            )}
        </div>
      </div>

      {/* Summary Card (Visible if logs exist) */}
      {filteredLogs.length > 0 && (
          <div className="grid grid-cols-5 gap-2 bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
              <div className="text-center">
                  <div className="text-gray-400 text-[10px] uppercase">Ккал</div>
                  <div className="text-white font-bold">{summary.calories.toFixed(0)}</div>
              </div>
              <div className="text-center">
                  <div className="text-gray-400 text-[10px] uppercase">Белки</div>
                  <div className="text-blue-400 font-bold">{summary.protein.toFixed(1)}</div>
              </div>
              <div className="text-center">
                  <div className="text-gray-400 text-[10px] uppercase">Жиры</div>
                  <div className="text-yellow-400 font-bold">{summary.fat.toFixed(1)}</div>
              </div>
              <div className="text-center">
                  <div className="text-gray-400 text-[10px] uppercase">Угл</div>
                  <div className="text-orange-400 font-bold">{summary.carbs.toFixed(1)}</div>
              </div>
              <div className="text-center">
                  <div className="text-gray-400 text-[10px] uppercase">Клетч</div>
                  <div className="text-green-400 font-bold">{summary.fiber.toFixed(1)}</div>
              </div>
          </div>
      )}

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 text-center">
          <Search size={48} className="mb-4 opacity-30" />
          <h3 className="text-lg font-medium mb-2">Записей не найдено</h3>
          <p className="text-sm px-6">
            {filterDate ? 'На выбранную дату нет записей.' : 'История пуста.'}
          </p>
          {filterDate && (
              <button 
                onClick={() => setFilterDate('')}
                className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
              >
                  Показать все записи
              </button>
          )}
        </div>
      )}

      {/* List */}
      {dates.map((date) => {
        const dayItems = groupedLogs[date];
        const dayTotalKcal = dayItems.reduce((sum, i) => sum + i.calories, 0);

        return (
          <div key={date} className="animate-fade-in-up">
            <div className="flex justify-between items-center px-2 mb-2 sticky top-0 bg-gray-900/95 py-2 z-10 backdrop-blur-sm border-b border-gray-800/50">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">{date}</h3>
              <span className="text-xs font-mono text-gray-400">
                {dayTotalKcal} ккал
              </span>
            </div>
            
            <div className="space-y-3">
              {dayItems.map((item) => {
                const isExpanded = expandedId === item.id;
                
                return (
                <div key={item.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-sm relative group hover:border-gray-600 transition-colors">
                  <div 
                    className="p-3 cursor-pointer" 
                    onClick={() => toggleExpand(item.id)}
                  >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 pr-8">
                          <div className="font-bold text-gray-200 text-base leading-tight flex items-center gap-2">
                             {item.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Clock size={10} />
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                             <div className="text-gray-500">
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                             </div>
                        </div>
                      </div>

                      {/* Mini Macros Row (Always visible) */}
                      <div className="grid grid-cols-5 gap-1 mt-3">
                        <div className="bg-gray-700/30 rounded p-1.5 flex flex-col items-center">
                            <span className="text-[10px] text-gray-400 mb-0.5"><Flame size={10} /></span>
                            <span className="font-bold text-white text-xs">{item.calories}</span>
                        </div>
                        <div className="bg-gray-700/30 rounded p-1.5 flex flex-col items-center">
                            <span className="text-[10px] text-blue-400 mb-0.5"><Dumbbell size={10} /></span>
                            <span className="font-medium text-gray-300 text-xs">{item.protein}</span>
                        </div>
                        <div className="bg-gray-700/30 rounded p-1.5 flex flex-col items-center">
                            <span className="text-[10px] text-yellow-400 mb-0.5"><Droplet size={10} /></span>
                            <span className="font-medium text-gray-300 text-xs">{item.fat}</span>
                        </div>
                        <div className="bg-gray-700/30 rounded p-1.5 flex flex-col items-center">
                            <span className="text-[10px] text-orange-400 mb-0.5"><Wheat size={10} /></span>
                            <span className="font-medium text-gray-300 text-xs">{item.carbs}</span>
                        </div>
                        <div className="bg-gray-700/30 rounded p-1.5 flex flex-col items-center">
                            <span className="text-[10px] text-green-400 mb-0.5"><Wheat size={10} /></span>
                            <span className="font-medium text-gray-300 text-xs">{item.fiber}</span>
                        </div>
                      </div>
                  </div>

                  {/* Expanded Content (Details + AI Text) */}
                  {isExpanded && (
                      <div className="px-3 pb-3 border-t border-gray-700/50 bg-gray-900/30 animate-fade-in">
                          
                          {/* Detailed Stats */}
                          <div className="grid grid-cols-2 gap-3 my-3">
                              {/* Omega Box */}
                              <div className="bg-gray-800/80 p-2 rounded-lg border border-gray-700">
                                  <div className="text-[10px] text-cyan-400 flex items-center gap-1 mb-1 font-bold">
                                      <Fish size={10} /> Омега 3/6
                                  </div>
                                  <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">ω-3</span>
                                      <span className="text-white font-mono">{item.omega3?.toFixed(2)}г</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">ω-6</span>
                                      <span className="text-white font-mono">{item.omega6?.toFixed(2)}г</span>
                                  </div>
                              </div>
                              
                              {/* Iron Box */}
                              <div className="bg-gray-800/80 p-2 rounded-lg border border-gray-700">
                                  <div className="text-[10px] text-rose-400 flex items-center gap-1 mb-1 font-bold">
                                      <Anchor size={10} /> Железо
                                  </div>
                                  <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">Всего</span>
                                      <span className="text-white font-mono">{item.ironTotal?.toFixed(1)}мг</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">Гемовое</span>
                                      <span className="text-white font-mono">{item.hemeIron?.toFixed(1)}мг</span>
                                  </div>
                              </div>
                          </div>

                          {/* Important Nutrients */}
                          {item.importantNutrients && item.importantNutrients.length > 0 && (
                            <div className="mb-3">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wide mb-1 block">Нутриенты:</span>
                                <div className="flex flex-wrap gap-1">
                                    {item.importantNutrients.map((n, i) => (
                                    <span key={i} className="bg-indigo-900/40 text-indigo-300 px-1.5 py-0.5 rounded text-[10px] border border-indigo-500/20">
                                        {n}
                                    </span>
                                    ))}
                                </div>
                            </div>
                          )}

                          {/* AI Analysis Text */}
                          {item.aiAnalysis && (
                              <div className="mb-3 bg-blue-900/10 p-2.5 rounded-lg border border-blue-500/10">
                                  <h4 className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-1">
                                      <Info size={12} /> Анализ AI
                                  </h4>
                                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                                      {item.aiAnalysis}
                                  </p>
                              </div>
                          )}

                          {/* Controls Row */}
                          <div className="flex justify-end pt-2 border-t border-gray-700/30">
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                className="text-gray-500 hover:text-red-400 text-xs flex items-center gap-1 px-2 py-1 hover:bg-red-900/10 rounded transition-colors"
                              >
                                <Trash2 size={12} /> Удалить запись
                              </button>
                          </div>
                      </div>
                  )}

                  {/* Note Section (Always available, but collapsible logic handled separately or inline) */}
                  {!isExpanded && (
                    <div className="px-3 pb-2 pt-0">
                        {editingId === item.id ? (
                        <div className="animate-fade-in mt-2">
                            <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Добавьте описание или заметку..."
                            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2 text-sm text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                            rows={2}
                            autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                            <button 
                                onClick={cancelEdit}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                            >
                                <X size={16} />
                            </button>
                            <button 
                                onClick={() => saveNote(item.id)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
                            >
                                <Check size={14} /> Сохранить
                            </button>
                            </div>
                        </div>
                        ) : (
                        <div 
                            className="group/note cursor-pointer mt-1" 
                            onClick={(e) => { e.stopPropagation(); startEditing(item.id, item.note); }}
                        >
                            {item.note ? (
                            <div className="flex items-start justify-between gap-2 bg-gray-900/30 p-1.5 rounded border border-gray-700/30">
                                <p className="text-xs text-gray-400 italic leading-relaxed line-clamp-2">{item.note}</p>
                                <span className="text-gray-600 hover:text-blue-400 opacity-0 group-hover/note:opacity-100 transition-opacity p-1">
                                <Edit2 size={10} />
                                </span>
                            </div>
                            ) : (
                            <button 
                                className="flex items-center gap-1.5 text-[10px] text-gray-600 hover:text-blue-400 transition-colors py-1"
                            >
                                <MessageSquare size={10} />
                                {item.note ? 'Изменить заметку' : 'Добавить заметку'}
                            </button>
                            )}
                        </div>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
            </div>
            
            <div className="h-4"></div>
          </div>
        );
      })}
    </div>
  );
};

export default FoodArchive;
