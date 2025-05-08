import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, RefreshCw, AlertTriangle, Loader2, Building2 } from 'lucide-react';
import { SearchCriteria, SearchResult, INDUSTRIES, STATES } from './types';
import { searchEntities } from './services/gemini';

function App() {
  const [criteria, setCriteria] = useState<SearchCriteria>({ industry: '', state: '' });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resultsPerPage = 10;
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = results.slice(startIndex, endIndex);

  const handleSearch = async () => {
    if (!criteria.industry || !criteria.state) {
      setError('Please select both industry and state');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      const searchResults = await searchEntities(criteria);
      setResults(searchResults);
      setCurrentPage(1);
      setHasSearched(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setCriteria({ industry: '', state: '' });
    setResults([]);
    setCurrentPage(1);
    setError(null);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Prospect Search
            </h1>
          </div>
          {hasSearched && (
            <div className="mt-3 flex items-center text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">Please hit the 'clear' button before making a new search.</p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full">
        {/* Search Interface */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-indigo-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="industry" className="block text-sm font-semibold text-gray-700">
                Industry
              </label>
              <select
                id="industry"
                value={criteria.industry}
                onChange={(e) => setCriteria(prev => ({ ...prev, industry: e.target.value }))}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                disabled={isLoading}
              >
                <option value="">Select Industry</option>
                {INDUSTRIES.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="state" className="block text-sm font-semibold text-gray-700">
                State
              </label>
              <select
                id="state"
                value={criteria.state}
                onChange={(e) => setCriteria(prev => ({ ...prev, state: e.target.value }))}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                disabled={isLoading}
              >
                <option value="">Select State</option>
                {STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </button>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-indigo-100">
            <div className="divide-y divide-gray-100">
              {currentResults.map((result) => (
                <div key={result.id} className="p-6 hover:bg-indigo-50 transition-colors duration-150">
                  <h3 className="text-lg font-semibold text-gray-900">{result.entityName}</h3>
                  <a
                    href={result.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 hover:underline mt-1 inline-block"
                  >
                    {result.websiteUrl}
                  </a>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100 rounded-b-2xl">
              <div className="flex-1 flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-indigo-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Made by Quintin - Powered by AI
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;