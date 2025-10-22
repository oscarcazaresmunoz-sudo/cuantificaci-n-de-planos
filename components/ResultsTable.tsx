
import React from 'react';
import type { BillItem } from '../types';

interface ResultsTableProps {
  data: BillItem[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No data to display.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-800">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider w-1/12">
              Código
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider w-7/12">
              Descripción
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider w-2/12">
              Unidad
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider w-2/12">
              Cantidad
            </th>
          </tr>
        </thead>
        <tbody className="bg-slate-800/50 divide-y divide-slate-700">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-slate-700/50 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-300">{item.codigo}</td>
              <td className="px-4 py-4 whitespace-normal text-sm text-slate-300">{item.descripcion}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-300">{item.unidad}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-300">{item.cantidad.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
