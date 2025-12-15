import React from 'react';
<<<<<<< HEAD
import { WebSource } from '../types';
=======
import { WebSource, SchoolStatus } from '../types';
>>>>>>> a1f8e1f46a5d3f79a405852c761abdf64c0bdb8d
import { ExternalLink, Globe } from 'lucide-react';

interface GroundingSourcesProps {
  sources: WebSource[];
}

const GroundingSources: React.FC<GroundingSourcesProps> = ({ sources }) => {
  if (sources.length === 0) return null;

<<<<<<< HEAD
=======
  const getStatusBadge = (status?: SchoolStatus) => {
    switch (status) {
      case SchoolStatus.OPEN:
        return <span className="px-2 py-1 text-xs font-bold bg-green-900/30 text-green-400 rounded border border-green-900/50">OPEN</span>;
      case SchoolStatus.DELAYED:
        return <span className="px-2 py-1 text-xs font-bold bg-orange-900/30 text-orange-400 rounded border border-orange-900/50">DELAYED</span>;
      case SchoolStatus.CLOSED:
        return <span className="px-2 py-1 text-xs font-bold bg-red-900/30 text-red-400 rounded border border-red-900/50">CLOSED</span>;
      default:
        // Don't show badge for unknown to keep UI clean
        return null;
    }
  };

>>>>>>> a1f8e1f46a5d3f79a405852c761abdf64c0bdb8d
  return (
    <div className="mt-8 bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Globe className="w-4 h-4" />
        Verified Sources
      </h3>
<<<<<<< HEAD
      <div className="grid gap-3 sm:grid-cols-2">
=======
      <div className="grid gap-3 sm:grid-cols-1">
>>>>>>> a1f8e1f46a5d3f79a405852c761abdf64c0bdb8d
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
<<<<<<< HEAD
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors group border border-slate-800 bg-slate-900/50"
          >
            <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-slate-700 transition-colors">
              <ExternalLink className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">
                {source.title}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {new URL(source.uri).hostname}
              </p>
=======
            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-colors group border border-slate-800 bg-slate-900/50"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-slate-700 transition-colors flex-shrink-0">
                <ExternalLink className="w-4 h-4 text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate pr-2">
                  {source.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {new URL(source.uri).hostname}
                </p>
              </div>
            </div>
            
            <div className="flex-shrink-0 ml-3">
              {getStatusBadge(source.status)}
>>>>>>> a1f8e1f46a5d3f79a405852c761abdf64c0bdb8d
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default GroundingSources;