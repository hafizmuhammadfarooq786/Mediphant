'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';

interface SearchMatch {
  text: string;
  score: number;
}

interface FAQResponse {
  answer: string;
  matches: SearchMatch[];
}

export default function FAQPage() {
  const [query, setQuery] = useState('medication adherence');
  const [result, setResult] = useState<FAQResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const searchQuery = query.trim();
    if (!searchQuery) {
      setError('Please enter a search query.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/faq?q=${encodeURIComponent(searchQuery)}`);

      if (!response.ok) {
        throw new Error('Failed to search FAQ');
      }

      const data = await response.json();
      setResult(data);
    } catch {
      setError('Failed to search medical FAQ. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const popularQueries = [
    'medication adherence',
    'pill organizer',
    'drug interactions',
    'medication list',
    'diabetes control',
    'pharmacist consultation'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="faq" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Medical FAQ Search
          </h1>
          <p className="text-lg text-gray-600">
            Get answers to medical questions using intelligent search
          </p>
        </div>

        <MedicalDisclaimer className="mb-8" />

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 bg-white"
                  placeholder="Ask about medications, adherence, or health topics..."
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {error && <ErrorMessage message={error} className="mt-3" />}
          </form>

          {/* Popular Queries */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Popular searches:</h3>
            <div className="flex flex-wrap gap-2">
              {popularQueries.map((popularQuery) => (
                <button
                  key={popularQuery}
                  onClick={() => setQuery(popularQuery)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {popularQuery}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Answer Section */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Answer</h3>
                    <p className="text-green-700 leading-relaxed">{result.answer}</p>
                  </div>
                </div>
              </div>

              {/* Sources Section */}
              {result.matches && result.matches.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Related Information
                  </h3>
                  <div className="space-y-3">
                    {result.matches.map((match, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            Source {index + 1}
                          </span>
                          <span className="text-sm text-blue-600 font-medium">
                            {(match.score * 100).toFixed(1)}% relevance
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{match.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Again */}
              <div className="text-center pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setQuery('');
                    setResult(null);
                    setError('');
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Search for something else
                </button>
              </div>
            </div>
          )}

          {loading && (
            <LoadingSpinner text="Searching medical information..." />
          )}

          {!result && !loading && (
            <EmptyState
              icon={
                <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Enter a medical question to get started"
              description="Try asking about medication adherence, drug interactions, or general health topics"
            />
          )}
        </div>

        {/* Features Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How it works</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900">Vector Search</h4>
                <p className="text-sm text-gray-600">Uses Pinecone and OpenAI embeddings for intelligent semantic search</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">2</span>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900">Fallback System</h4>
                <p className="text-sm text-gray-600">Automatic fallback to TF-IDF search if external services are unavailable</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}