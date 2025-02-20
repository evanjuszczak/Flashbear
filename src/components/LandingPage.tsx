import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Brain, Zap, Trophy } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Book className="w-8 h-8 text-indigo-600" />
                <div className="ml-2">
                  <h1 className="text-xl font-bold text-gray-900">Flashbear</h1>
                  <p className="text-sm text-gray-500">by Evan Juszczak</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Master Any Subject with
              <span className="text-indigo-600"> Flashbear</span>
            </h2>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              The smarter way to study. Create, practice, and master your flashcards with powerful learning tools.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  to="/signup"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Why Choose Flashbear?
            </h2>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              <div className="text-center">
                <div className="flex justify-center">
                  <Brain className="h-12 w-12 text-indigo-600" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">
                  Smart Learning
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Adaptive learning algorithms that adjust to your progress and help you focus on what you need to review.
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center">
                  <Zap className="h-12 w-12 text-indigo-600" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">
                  Quick Creation
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Create flashcard sets in seconds with our intuitive interface and import tools.
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center">
                  <Trophy className="h-12 w-12 text-indigo-600" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">
                  Track Progress
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Monitor your learning progress and celebrate your achievements as you master each set.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to boost your learning?</span>
            <span className="block">Start using Flashbear today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Join thousands of students who are already learning smarter, not harder.
          </p>
          <Link
            to="/signup"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
          >
            Sign up for free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Contact
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; {new Date().getFullYear()} Flashbear. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 