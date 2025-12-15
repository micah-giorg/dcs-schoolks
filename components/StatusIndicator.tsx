import React from 'react';
import { SchoolStatus } from '../types';
import { CheckCircle, XCircle, Clock, HelpCircle, Loader2 } from 'lucide-react';

interface StatusIndicatorProps {
  status: SchoolStatus | null;
  loading: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, loading }) => {
  // Only show the full loading screen if we don't have any status data yet
  if (loading && !status) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-pulse">
        <Loader2 className="w-24 h-24 text-blue-500/80 animate-spin mb-4" />
        <h2 className="text-2xl font-semibold text-gray-400">Scanning News Sources...</h2>
        <p className="text-gray-600 mt-2">Checking 10TV, NBC4, ABC6, and District Site</p>
      </div>
    );
  }

  // Default / Unknown State
  let bgColor = "bg-slate-900";
  let textColor = "text-gray-300";
  let borderColor = "border-slate-800";
  let icon = <HelpCircle className="w-32 h-32 text-gray-700" />;
  let statusText = "STATUS UNKNOWN";

  switch (status) {
    case SchoolStatus.OPEN:
      // Dark green
      bgColor = "bg-green-950/20"; 
      borderColor = "border-green-900/50";
      textColor = "text-green-400";
      icon = <CheckCircle className="w-32 h-32 text-green-600/80" />;
      statusText = "SCHOOLS ARE OPEN";
      break;
    case SchoolStatus.CLOSED:
      // Dark red
      bgColor = "bg-red-950/20";
      borderColor = "border-red-900/50";
      textColor = "text-red-400";
      icon = <XCircle className="w-32 h-32 text-red-600/80" />;
      statusText = "SCHOOLS ARE CLOSED";
      break;
    case SchoolStatus.DELAYED:
      // Dark orange/yellow - made slightly more vibrant for visibility
      bgColor = "bg-orange-950/30";
      borderColor = "border-orange-900/60";
      textColor = "text-orange-400";
      icon = <Clock className="w-32 h-32 text-orange-500/90" />;
      statusText = "SCHOOLS ARE DELAYED";
      break;
    default:
      // Keep default slate
      break;
  }

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 rounded-3xl ${bgColor} transition-all duration-500 shadow-xl border ${borderColor}`}>
      <div className="mb-6 transform transition-transform hover:scale-105 duration-300">
        {icon}
      </div>
      <h1 className={`text-3xl md:text-5xl font-bold text-center tracking-tight ${textColor}`}>
        {statusText}
      </h1>
    </div>
  );
};

export default StatusIndicator;