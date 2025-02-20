import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Flashcard } from '../types/database';

interface Question {
  id: string;
  prompt: string;
  correctAnswer: string;
  options: string[];
}

export function PracticeTest() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCards() {
      try {
        const { data, error } = await supabase
          .from('flashcards')
          .select('*')
          .eq('set_id', setId);

        if (error) throw error;
        if (!data.length) throw new Error('No flashcards found in this set');

        // Generate questions from flashcards
        const generatedQuestions = generateQuestions(data);
        setQuestions(generatedQuestions);
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

  const generateQuestions = (cards: Flashcard[]): Question[] => {
    return cards.map(card => {
      // Get 3 random incorrect answers from other cards
      const otherAnswers = cards
        .filter(c => c.id !== card.id)
        .map(c => c.back)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // Combine correct and incorrect answers, shuffle them
      const options = [...otherAnswers, card.back]
        .sort(() => Math.random() - 0.5);

      return {
        id: card.id,
        prompt: card.front,
        correctAnswer: card.back,
        options,
      };
    });
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: answer,
    }));
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    };
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

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Test Results</h2>
            <div className="text-center mb-8">
              <p className="text-4xl font-bold text-indigo-600 mb-2">{score.percentage}%</p>
              <p className="text-gray-600">
                You got {score.correct} out of {score.total} questions correct
              </p>
            </div>

            <div className="space-y-6">
              {questions.map((question, index) => {
                const isCorrect = answers[question.id] === question.correctAnswer;
                return (
                  <div
                    key={question.id}
                    className={`p-4 rounded-lg ${
                      isCorrect ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">Question {index + 1}</p>
                        <p className="text-gray-700">{question.prompt}</p>
                        <p className="mt-1">
                          Your answer: <span className="font-medium">{answers[question.id]}</span>
                        </p>
                        {!isCorrect && (
                          <p className="mt-1 text-green-700">
                            Correct answer: <span className="font-medium">{question.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setAnswers({});
                  setSelectedAnswer(null);
                  setShowResults(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Exit Test
          </button>
          <span className="text-sm text-gray-600">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-medium text-gray-900 mb-6">{currentQuestion.prompt}</h2>

          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={`w-full p-4 text-left rounded-lg border transition-colors ${
                  selectedAnswer === option
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={nextQuestion}
              disabled={!selectedAnswer}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}