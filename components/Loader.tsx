
import React from 'react';

interface LoaderProps {
    log: string[];
}

export const Loader: React.FC<LoaderProps> = ({ log }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400 mb-6"></div>
      <h3 className="text-lg font-semibold text-white mb-4">Análisis en Progreso...</h3>
      <div className="w-full max-w-md text-left text-sm text-slate-400 bg-slate-900 p-4 rounded-lg">
        <ul>
          {log.map((message, index) => (
            <li key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
              <span className="text-cyan-500 mr-2">»</span> {message}
            </li>
          ))}
        </ul>
      </div>
       <style>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out forwards;
            opacity: 0;
          }
        `}</style>
    </div>
  );
};
