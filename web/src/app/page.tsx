import Link from 'next/link';
import Header from '@/components/Header';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="home" />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Medical Information
            <span className="block text-blue-600">Made Simple</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
            Check medication interactions and get answers to medical questions with our comprehensive healthcare tools.
          </p>

          <MedicalDisclaimer className="mt-8 max-w-3xl mx-auto" />
        </div>

        {/* Feature Cards */}
        <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Drug Interactions Card */}
          <Link href="/interactions" className="group">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 border-2 border-transparent group-hover:border-blue-200">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.882 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                  Medication Interaction Checker
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Check potential interactions between two medications. Our database includes common drug combinations
                and their associated risks.
              </p>
              <div className="flex items-center text-blue-600 group-hover:text-blue-800 font-medium">
                Check Interactions
                <svg className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Examples */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Example interactions:</p>
                <div className="space-y-1">
                  <div className="text-xs text-red-600">• Warfarin + Ibuprofen</div>
                  <div className="text-xs text-red-600">• Metformin + Contrast dye</div>
                  <div className="text-xs text-red-600">• Lisinopril + Spironolactone</div>
                </div>
              </div>
            </div>
          </Link>

          {/* FAQ Search Card */}
          <Link href="/faq" className="group">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 border-2 border-transparent group-hover:border-green-200">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-xl font-semibold text-gray-900 group-hover:text-green-600">
                  Medical FAQ Search
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Get answers to medical questions using our intelligent search system. Ask about medications,
                adherence, or general health topics.
              </p>
              <div className="flex items-center text-green-600 group-hover:text-green-800 font-medium">
                Search FAQ
                <svg className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Examples */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Try searching for:</p>
                <div className="space-y-1">
                  <div className="text-xs text-green-600">• medication adherence</div>
                  <div className="text-xs text-green-600">• pill organizer</div>
                  <div className="text-xs text-green-600">• drug interactions</div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Technical Features */}
        <div className="mt-16 bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Technical Features</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Rate Limited APIs</h4>
              <p className="text-sm text-gray-600">Protected with 100 requests per minute rate limiting</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Input Validation</h4>
              <p className="text-sm text-gray-600">Enhanced validation with Zod schemas and sanitization</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Recent History</h4>
              <p className="text-sm text-gray-600">Track recent medication checks with timestamps</p>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="mt-16 bg-gray-900 text-white rounded-lg p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-6 text-center">API Endpoints</h3>
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm bg-blue-600 px-2 py-1 rounded">POST</span>
                <span className="font-mono text-sm">/api/interactions</span>
              </div>
              <p className="text-gray-300 text-sm">Check medication interactions between two drugs</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm bg-green-600 px-2 py-1 rounded">GET</span>
                <span className="font-mono text-sm">/api/faq?q=query</span>
              </div>
              <p className="text-gray-300 text-sm">Search medical FAQ with vector similarity or fallback</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm bg-green-600 px-2 py-1 rounded">GET</span>
                <span className="font-mono text-sm">/api/history</span>
              </div>
              <p className="text-gray-300 text-sm">Retrieve recent medication interaction checks</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Built for Mediphant Practical Test - September 2024
            </p>
            <div className="flex space-x-6">
              <span className="text-sm text-gray-500">Next.js 15.5</span>
              <span className="text-sm text-gray-500">TypeScript</span>
              <span className="text-sm text-gray-500">Tailwind CSS</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}