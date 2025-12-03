import React from 'react';
import { Info, X } from 'lucide-react';
import { HELP_TOPICS, HelpTopicKey } from '../data/helpTopics';

interface Props {
    topic: HelpTopicKey | null;
    onClose: () => void;
}

const InfoModal: React.FC<Props> = ({ topic, onClose }) => {
    if (!topic) return null;
    const data = HELP_TOPICS[topic];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-800 rounded-2xl border border-gray-700 p-5 w-full max-w-sm shadow-2xl animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Info size={20} className="text-blue-400" />
                        {data.title}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                {data.content}
                <button 
                    onClick={onClose}
                    className="w-full mt-5 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-xl text-sm font-medium transition-colors"
                >
                    Понятно
                </button>
            </div>
        </div>
    );
};

export default InfoModal;