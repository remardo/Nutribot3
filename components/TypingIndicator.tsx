import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex w-full mb-4 justify-start animate-fade-in-up">
      <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-700 flex items-center gap-1.5 shadow-sm">
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-typing-dot [animation-delay:-0.32s]"></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-typing-dot [animation-delay:-0.16s]"></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-typing-dot"></div>
      </div>
    </div>
  );
};

export default TypingIndicator;