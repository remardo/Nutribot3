import React from 'react';
import { getNutrientStatus, StatusIndicator, getGlowStyle } from '../utils/nutrientUtils';

interface Props { 
    label: string; 
    value: number; 
    target: number; 
    color: string;
    icon?: React.ReactNode;
}

const NutrientProgressBar: React.FC<Props> = ({ label, value, target, color, icon }) => {
    const status = getNutrientStatus(value, target);
    
    // Calculate percentage
    const percentage = Math.min((value / target) * 100, 100);
    
    // Determine visual styles
    const isMet = status === 'met';
    const isExcess = status === 'excess';
    const glowClass = isMet ? getGlowStyle(color) : '';
    
    let containerClass = "border-gray-700";
    if (isExcess) {
        containerClass = "border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.15)]";
    } else if (status === 'low') {
        containerClass = "border-yellow-500/40";
    }

    const valueColorClass = isExcess ? 'text-red-400' : (isMet ? 'text-green-400' : 'text-white');

    return (
        <div className="mb-3">
            <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-gray-300 flex items-center gap-1.5 font-medium">
                    {icon} {label}
                </span>
                <span className="text-gray-400 flex items-center gap-1.5">
                    <span className={`font-bold transition-colors duration-300 ${valueColorClass}`}>
                        {value.toFixed(0)}
                    </span>
                    <span className="opacity-60">/{target}</span>
                    <StatusIndicator status={status} />
                </span>
            </div>
            <div className={`w-full bg-gray-700/50 rounded-full h-2 border relative overflow-hidden transition-colors duration-500 ${containerClass}`}>
                <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out relative ${isExcess ? 'bg-red-500' : color} ${glowClass}`} 
                    style={{ width: `${percentage}%` }}
                >
                     {/* Subtle inner sheen when met */}
                     {isMet && !isExcess && (
                        <div className="absolute inset-0 bg-white/20"></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NutrientProgressBar;