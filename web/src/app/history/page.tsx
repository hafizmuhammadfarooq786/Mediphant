'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';

interface QueryHistoryItem {
  id: string;
  medA: string;
  medB: string;
  isPotentiallyRisky: boolean;
  reason: string;
  timestamp: Date;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/history');

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      setHistory(data.history || []);
      setError('');
    } catch {
      setError('Failed to load interaction history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm('Are you sure you want to clear all interaction history? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/history', { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to clear history');
      }

      setHistory([]);
      setError('');
    } catch {
      setError('Failed to clear history. Please try again.');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="history" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Interaction History
            </h1>
            <p className="text-lg text-gray-600">
              View your recent medication interaction checks
            </p>
          </div>

          {history.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={fetchHistory}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={clearHistory}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            </div>
          )}
        </div>

        {error && <ErrorMessage message={error} className="mb-6" />}

        <div className="bg-white rounded-lg shadow-md">
          {loading && (
            <LoadingSpinner text="Loading history..." />
          )}

          {!loading && history.length === 0 && (
            <EmptyState
              icon={
                <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              title="No interaction history"
              description="Start checking medication interactions to see your history here."
              actionLabel="Check Interactions"
              actionHref="/interactions"
            />
          )}

          {/* History List */}
          {!loading && history.length > 0 && (
            <div className="divide-y divide-gray-200">
              {/* Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Recent Checks ({history.length})
                  </h3>
                  <span className="text-sm text-gray-500">
                    Most recent first
                  </span>
                </div>
              </div>

              {/* History Items */}
              <div className="max-h-96 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                      item.isPotentiallyRisky ? 'border-l-4 border-red-400' : 'border-l-4 border-green-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900 mr-1">{item.medA}</span>
                            <span className="text-gray-500 mx-2">+</span>
                            <span className="font-medium text-gray-900 ml-1">{item.medB}</span>
                          </div>

                          <div className="ml-4">
                            {item.isPotentiallyRisky ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5v3a.75.75 0 001.5 0v-3A.75.75 0 009 9z" clipRule="evenodd" />
                                </svg>
                                Risk Detected
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.53a.75.75 0 00-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                </svg>
                                Safe
                              </span>
                            )}
                          </div>
                        </div>

                        <p className={`text-sm ${
                          item.isPotentiallyRisky ? 'text-red-700' : 'text-green-700'
                        }`}>
                          {item.reason}
                        </p>
                      </div>

                      <div className="flex flex-col items-end text-sm text-gray-500">
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        {!loading && history.length > 0 && (
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {history.length}
              </div>
              <div className="text-sm text-gray-600">Total Checks</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {history.filter(item => item.isPotentiallyRisky).length}
              </div>
              <div className="text-sm text-gray-600">Risky Interactions</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {history.filter(item => !item.isPotentiallyRisky).length}
              </div>
              <div className="text-sm text-gray-600">Safe Combinations</div>
            </div>
          </div>
        )}

        {/* Additional Actions */}
        {!loading && history.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-900 mb-2">Want to check more interactions?</h3>
            <p className="text-blue-700 text-sm mb-4">
              Continue monitoring your medications by checking new drug combinations.
            </p>
            <Link
              href="/interactions"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Check New Interactions
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}