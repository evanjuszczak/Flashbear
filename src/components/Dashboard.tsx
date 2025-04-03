import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Book, Loader2 } from 'lucide-react';
import { useFlashcardStore } from '../store/flashcardStore';
import { useAuthStore } from '../store/authStore';

export function Dashboard() {
  const { sets, loading, error, fetchSets } = useFlashcardStore();
  const { signOut } = useAuthStore();

  useEffect(() => {
    fetchSets();
  }, [fetchSets]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <Book className="w-8 h-8 text-indigo-600" />
                <div className="ml-2">
                  <h1 className="text-xl font-bold text-gray-900">Flashbear</h1>
                  <p className="text-sm text-gray-500">by Evan Juszczak</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => signOut()}
                className="ml-4 text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Flashbear Sets</h2>
          <Link
            to="/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Set
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {sets.length === 0 ? (
          <div className="text-center py-12">
            <Book className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No flashcard sets</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new set.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sets.map((set) => (
              <div key={set.id} className="relative">
                <Link
                  to={`/edit/${set.id}`}
                  className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{set.title}</h3>
                    {set.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{set.description}</p>
                    )}
                    <p className="mt-4 text-xs text-gray-400">
                      Created {new Date(set.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                <div className="absolute top-0 right-0 mt-4 mr-4 flex space-x-2">
                  <Link
                    to={`/study/${set.id}`}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-200"
                  >
                    Study
                  </Link>
                  <Link
                    to={`/practice/${set.id}`}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200"
                  >
                    Practice
                  </Link>
                  <Link
                    to={`/game/${set.id}`}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200"
                  >
                    Game
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}