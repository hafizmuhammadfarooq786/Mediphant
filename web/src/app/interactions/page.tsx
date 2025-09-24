'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';
import ErrorMessage from '@/components/ErrorMessage';
import RecentChecks from '@/components/RecentChecks';

interface InteractionResult {
  pair: [string, string];
  isPotentiallyRisky: boolean;
  reason: string;
  advice: string;
}

export default function InteractionsPage() {
  const [medA, setMedA] = useState('warfarin');
  const [medB, setMedB] = useState('ibuprofen');
  const [result, setResult] = useState<InteractionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateInputs = () => {
    const trimmedA = medA.trim();
    const trimmedB = medB.trim();

    if (!trimmedA || !trimmedB) {
      return 'Both medication fields are required.';
    }

    if (trimmedA.toLowerCase() === trimmedB.toLowerCase()) {
      return 'Please enter two different medications.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medA: medA.trim(),
          medB: medB.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check interactions');
      }

      const data = await response.json();
      setResult(data);

      // Refresh recent checks after successful query
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refreshHistory'));
      }, 100);
    } catch {
      setError('Failed to check medication interactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="interactions" />

      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Medication Interaction Checker
          </h1>

          <MedicalDisclaimer className="mb-6" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="medA" className="block text-sm font-medium text-gray-700 mb-1">
                First Medication
              </label>
              <input
                type="text"
                id="medA"
                value={medA}
                onChange={(e) => setMedA(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                placeholder="Enter first medication name"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="medB" className="block text-sm font-medium text-gray-700 mb-1">
                Second Medication
              </label>
              <input
                type="text"
                id="medB"
                value={medB}
                onChange={(e) => setMedB(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                placeholder="Enter second medication name"
                disabled={loading}
              />
            </div>

            {error && <ErrorMessage message={error} />}

            {/* Quick Test Buttons */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick test combinations:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { setMedA('warfarin'); setMedB('ibuprofen'); }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  Warfarin + Ibuprofen
                </button>
                <button
                  type="button"
                  onClick={() => { setMedA('metformin'); setMedB('contrast dye'); }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  Metformin + Contrast dye
                </button>
                <button
                  type="button"
                  onClick={() => { setMedA('lisinopril'); setMedB('spironolactone'); }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  Lisinopril + Spironolactone
                </button>
                <button
                  type="button"
                  onClick={() => { setMedA('aspirin'); setMedB('vitamins'); }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  Aspirin + Vitamins (Safe)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking...' : 'Check Interactions'}
            </button>
          </form>

          {result && (
            <div className="mt-6">
              <div className={`p-4 rounded-md ${
                result.isPotentiallyRisky
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {result.isPotentiallyRisky ? (
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.53a.75.75 0 00-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      result.isPotentiallyRisky ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {result.isPotentiallyRisky ? 'Potential Interaction Detected' : 'No Known Interactions'}
                    </h3>
                    <div className={`mt-2 text-sm ${
                      result.isPotentiallyRisky ? 'text-red-700' : 'text-green-700'
                    }`}>
                      <p className="mb-2">
                        <strong>Medications:</strong> {result.pair.join(' and ')}
                      </p>
                      {result.isPotentiallyRisky && (
                        <>
                          <p className="mb-2">
                            <strong>Reason:</strong> {result.reason}
                          </p>
                          <p>
                            <strong>Advice:</strong> {result.advice}
                          </p>
                        </>
                      )}
                      {!result.isPotentiallyRisky && (
                        <p>No known interactions found in our database for this medication combination.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <RecentChecks />
        </div>
      </div>
      </div>
    </div>
  );
}