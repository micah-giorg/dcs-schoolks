import React, { useState, useEffect } from 'react';
import { checkSchoolStatus } from './services/geminiService';
import { StatusResponse, SchoolStatus } from './types';
import StatusIndicator from './components/StatusIndicator';
import GroundingSources from './components/GroundingSources';
import Header from './components/Header';
// Merging the imports to include all necessary icons: RefreshCw, AlertTriangle, Info, Calendar
import { RefreshCw, AlertTriangle, Info, Calendar } from 'lucide-react'; 

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await checkSchoolStatus();
      setData(result);
      if (result.status === SchoolStatus.UNKNOWN && result.sources.length === 0) {
          setError(true);
      }
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-gray-100">
      <Header />

      <main className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Main Status Card */}
        <StatusIndicator status={data?.status ?? null} loading={loading} />

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
             {/* Display the date being checked (Today or Tomorrow depending on time) */}
             <div className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {data?.checkedDate 
                    ? `Status for ${data.checkedDate}` 
                    : 'Checking Date...'}
                </span>
             </div>
             <span className="hidden sm:inline">
               {data?.timestamp ? `Updated ${data.timestamp}` : ''}
             </span>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Error State */}
        {error && !loading && (
           <div className="mt-6 p-4 bg-red-950/20 border border-red-900/50 rounded-xl flex items-start gap-3">
             <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
             <div>
               <h3 className="text-sm font-semibold text-red-400">Connection Error</h3>
               <p className="text-sm text-red-300/60 mt-1">
                 We couldn't connect to our intelligence sources. Please check your internet connection or try again later.
               </p>
             </div>
           </div>
        )}

        {/* AI Summary Section and Sources List (Combined) */}
        {!loading && data && !error && (
          <div className="mt-8 animate-fade-in-up">
            
            {/* AI Summary Section - Kept from HEAD */}
            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-indigo-950/50 p-1.5 rounded-md border border-indigo-900/30">
                    <Info className="w-4 h-4 text-indigo-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-100">Intelligence Summary</h2>
              </div>
              <p className="text-gray-400 leading-relaxed text-base">
                {data.summary}
              </p>
            </div>

            {/* Sources List */}
            <GroundingSources sources={data.sources} />
            
            {/* Disclaimer */}
            <p className="text-xs text-gray-700 text-center mt-12 mb-4">
              Information is gathered by AI from public news sources (10TV, NBC4, ABC6) and district sites. Always verify with official school communication channels.
            </p>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
