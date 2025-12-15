import React, { useState, useEffect, useCallback } from 'react';
import { checkSchoolStatus } from './services/geminiService';
import { StatusResponse, SchoolStatus } from './types';
import StatusIndicator from './components/StatusIndicator';
import GroundingSources from './components/GroundingSources';
import Header from './components/Header';
import { RefreshCw, AlertTriangle, Calendar } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchData();
    
    const intervalId = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchData]);

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
            {loading ? 'Scanning...' : 'Refresh'}
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

        {/* Sources List & Disclaimer */}
        {!loading && data && !error && (
          <div className="mt-8 animate-fade-in-up">
            
            <GroundingSources sources={data.sources} />
            
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