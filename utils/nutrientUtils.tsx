import React from 'react';
import { AlertTriangle, AlertCircle, Check, Circle } from 'lucide-react';

export type NutrientStatus = 'excess' | 'low' | 'met' | 'normal';

export const getNutrientStatus = (val: number, target: number): NutrientStatus => {
    if (val > target * 1.1) return 'excess';
    if (val > 0 && val < target * 0.15) return 'low';
    if (val >= target) return 'met';
    return 'normal';
};

export const getGlowStyle = (colorClass: string) => {
    if (colorClass.includes('red') || colorClass.includes('pink')) return 'shadow-[0_0_12px_rgba(244,63,94,0.6)] brightness-110';
    if (colorClass.includes('blue')) return 'shadow-[0_0_12px_rgba(59,130,246,0.6)] brightness-110';
    if (colorClass.includes('yellow')) return 'shadow-[0_0_12px_rgba(234,179,8,0.6)] brightness-110';
    if (colorClass.includes('orange')) return 'shadow-[0_0_12px_rgba(249,115,22,0.6)] brightness-110';
    if (colorClass.includes('green')) return 'shadow-[0_0_12px_rgba(34,197,94,0.6)] brightness-110';
    return 'shadow-[0_0_12px_rgba(255,255,255,0.4)] brightness-110';
};

export const StatusIndicator: React.FC<{ status: NutrientStatus }> = ({ status }) => {
    switch (status) {
        case 'excess': 
            return <AlertTriangle size={14} className="text-red-400" strokeWidth={2.5} />;
        case 'low': 
            return <AlertCircle size={14} className="text-yellow-500" strokeWidth={2.5} />;
        case 'met': 
            return <Check size={14} className="text-green-400 animate-pulse" strokeWidth={3} />;
        default: 
            return <Circle size={12} className="text-gray-600" strokeWidth={2.5} />;
    }
};