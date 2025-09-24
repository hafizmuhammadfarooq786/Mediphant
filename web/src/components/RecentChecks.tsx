'use client';

import { useEffect, useState } from 'react';
import type { QueryHistoryItem } from '@/lib/queryHistory';

export default function RecentChecks() {
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      const response = await fetch('/api/history', { method: 'DELETE' });
      if (response.ok) {
        setHistory([]);
      }
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  useEffect(() => {
    fetchHistory();

    // Listen for refresh events
    const handleRefresh = () => fetchHistory();
    window.addEventListener('refreshHistory', handleRefresh);

    return () => {
      window.removeEventListener('refreshHistory', handleRefresh);
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Recent Checks</h2>
        <button
          onClick={clearHistory}
          className="text-sm text-gray-500 hover:text-red-600 underline"
        >
          Clear History
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-md text-sm ${
                item.isPotentiallyRisky
                  ? 'bg-red-50 border-l-4 border-red-400'
                  : 'bg-green-50 border-l-4 border-green-400'
              }`}
            >
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {item.medA} + {item.medB}
                </div>
                <div className={`text-xs ${
                  item.isPotentiallyRisky ? 'text-red-600' : 'text-green-600'
                }`}>
                  {item.reason}
                </div>
              </div>

              <div className="text-xs text-gray-500 ml-4">
                {new Date(item.timestamp).toLocaleTimeString()}
              </div>

              <div className="ml-2">
                {item.isPotentiallyRisky ? (
                  <span className="text-red-500 text-xs">Risk</span>
                ) : (
                  <span className="text-green-500 text-xs">Safe</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}