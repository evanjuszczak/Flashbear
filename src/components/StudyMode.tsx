import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCcw, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Flashcard } from '../types/database';

export function StudyMode() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCards() {
      try {
        const { data, error } = await supabase
          .from('flashcards')
          .select('*')
          .eq('set_id', setId)
          .order('created_at');

        if (error) throw error;
        setCards(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch flashcards');
      } finally {
        setLoading(false);
      }
    }

    if (setId) {
      fetchCards();
    }
  }, [setId]);

  const goToNextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const goToPreviousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const resetStudySession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No flashcards found in this set.</p>
          <button
            onClick={() => navigate('/')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5 mr-1" />
            Exit
          </button>
          <div className="flex items-center space-x-4">
            <button
              onClick={resetStudySession}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <RotateCcw className="w-5 h-5 mr-1" />
              Reset
            </button>
            <span className="text-sm text-gray-600">
              {currentIndex + 1} of {cards.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Flashcard */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`cursor-pointer perspective-1000 relative w-full aspect-[3/2] mb-8`}
        >
          <div
            className={`w-full h-full transition-transform duration-500 transform-style-preserve-3d relative ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front */}
            <div className="absolute w-full h-full bg-white rounded-xl shadow-lg p-8 flex items-center justify-center backface-hidden">
              <p className="text-2xl text-center">{currentCard.front}</p>
            </div>
            {/* Back */}
            <div className="absolute w-full h-full bg-white rounded-xl shadow-lg p-8 flex items-center justify-center backface-hidden rotate-y-180">
              <p className="text-2xl text-center">{currentCard.back}</p>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-center items-center space-x-8">
          <button
            onClick={goToPreviousCard}
            disabled={currentIndex === 0}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={goToNextCard}
            disabled={currentIndex === cards.length - 1}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ArrowRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}