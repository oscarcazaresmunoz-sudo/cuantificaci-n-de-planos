
import React from 'react';
import { HvacIcon } from './icons/HvacIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/60 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-800">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center gap-4">
        <div className="bg-cyan-500/10 p-2 rounded-lg">
          <HvacIcon className="w-8 h-8 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            HVAC AI Bill of Materials
          </h1>
          <p className="text-sm text-slate-400">
            Generador de Catálogo de Conceptos con IA a partir de planos PDF
          </p>
        </div>
      </div>
    </header>
  );
};
