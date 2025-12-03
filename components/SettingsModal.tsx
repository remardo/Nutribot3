
import React, { useState } from 'react';
import { UserGoals } from '../types';
import { X, Save, Target } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentGoals: UserGoals;
  onSave: (newGoals: UserGoals) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, currentGoals, onSave }) => {
  const [formData, setFormData] = useState<UserGoals>(currentGoals);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto border border-gray-700 animate-fade-in-up">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Target size={20} className="text-blue-500" />
            Цели питания
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Калории (ккал)</label>
            <input 
              type="number"
              name="calories"
              value={formData.calories}
              onChange={handleChange}
              min="0"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-blue-400 uppercase tracking-wide">Белки (г)</label>
              <input 
                type="number"
                name="protein"
                value={formData.protein}
                onChange={handleChange}
                min="0"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-yellow-400 uppercase tracking-wide">Жиры (г)</label>
              <input 
                type="number"
                name="fat"
                value={formData.fat}
                onChange={handleChange}
                min="0"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-orange-400 uppercase tracking-wide">Углеводы (г)</label>
              <input 
                type="number"
                name="carbs"
                value={formData.carbs}
                onChange={handleChange}
                min="0"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
             <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Микронутриенты</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-green-400 uppercase tracking-wide">Клетчатка (г)</label>
                    <input 
                        type="number"
                        name="fiber"
                        value={formData.fiber}
                        onChange={handleChange}
                        min="0"
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-rose-400 uppercase tracking-wide">Железо (мг)</label>
                    <input 
                        type="number"
                        name="iron"
                        value={formData.iron}
                        onChange={handleChange}
                        min="0"
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-cyan-400 uppercase tracking-wide">Омега-3 (г)</label>
                    <input 
                        type="number"
                        name="omega3"
                        value={formData.omega3}
                        onChange={handleChange}
                        step="0.1"
                        min="0"
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-indigo-400 uppercase tracking-wide">Омега-6 (г)</label>
                    <input 
                        type="number"
                        name="omega6"
                        value={formData.omega6}
                        onChange={handleChange}
                        step="0.1"
                        min="0"
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
             </div>
          </div>

          <div className="pt-2 sticky bottom-0 bg-gray-800 pb-2">
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Save size={18} />
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;