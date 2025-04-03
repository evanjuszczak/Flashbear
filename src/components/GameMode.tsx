import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Flashcard } from '../types/database';

export function GameMode() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [rocketPosition, setRocketPosition] = useState(50);
  const [projectiles, setProjectiles] = useState<{ id: number; x: number; y: number }[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const [nextProjectileId, setNextProjectileId] = useState(0);

  // Fetch cards
  useEffect(() => {
    async function fetchCards() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('flashcards')
          .select('*')
          .eq('set_id', setId)
          .order('created_at');

        if (error) throw error;
        
        if (data.length < 4) {
          throw new Error('Need at least 4 cards to play the game');
        }
        
        setCards(data);
        
        // Generate initial options
        if (data.length > 0) {
          generateOptions(data, 0);
        }
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

  // Generate answer options for the current question
  const generateOptions = (allCards: Flashcard[], currentIndex: number) => {
    const correctAnswer = allCards[currentIndex].back;
    const otherAnswers = allCards
      .filter((_, index) => index !== currentIndex)
      .map(card => card.back)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [...otherAnswers, correctAnswer].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  // Start game
  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setCurrentCardIndex(0);
    generateOptions(cards, 0);
    setProjectiles([]);
  };

  // Reset game
  const resetGame = () => {
    setGameActive(false);
    setScore(0);
    setCurrentCardIndex(0);
    generateOptions(cards, 0);
    setProjectiles([]);
  };

  // Handle keyboard/mouse movement
  useEffect(() => {
    if (!gameActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setRocketPosition(prev => Math.max(5, prev - 5));
      } else if (e.key === 'ArrowRight') {
        setRocketPosition(prev => Math.min(95, prev + 5));
      } else if (e.key === ' ' || e.key === 'Enter') {
        fireProjectile();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!gameAreaRef.current) return;
      
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const position = (x / rect.width) * 100;
      setRocketPosition(Math.min(Math.max(5, position), 95));
    };

    const handleClick = () => {
      fireProjectile();
    };

    window.addEventListener('keydown', handleKeyDown);
    if (gameAreaRef.current) {
      gameAreaRef.current.addEventListener('mousemove', handleMouseMove);
      gameAreaRef.current.addEventListener('click', handleClick);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gameAreaRef.current) {
        gameAreaRef.current.removeEventListener('mousemove', handleMouseMove);
        gameAreaRef.current.removeEventListener('click', handleClick);
      }
    };
  }, [gameActive]);

  // Fire projectile
  const fireProjectile = () => {
    if (!gameActive) return;
    
    setProjectiles(prev => [
      ...prev, 
      { 
        id: nextProjectileId, 
        x: rocketPosition, 
        y: 90 
      }
    ]);
    setNextProjectileId(prev => prev + 1);
  };

  // Move projectiles and detect collisions
  useEffect(() => {
    if (!gameActive || projectiles.length === 0) return;

    const interval = setInterval(() => {
      setProjectiles(prev => {
        // Move projectiles upward
        const updatedProjectiles = prev
          .map(p => ({ ...p, y: p.y - 3 }))
          .filter(p => p.y > 0);
        
        return updatedProjectiles;
      });

      // Check for collisions with answers
      const answerElements = document.querySelectorAll('.answer-option');
      projectiles.forEach(projectile => {
        const projElement = document.getElementById(`proj-${projectile.id}`);
        if (!projElement) return;

        const projRect = projElement.getBoundingClientRect();
        
        answerElements.forEach((answerElem, index) => {
          const answerRect = answerElem.getBoundingClientRect();
          
          // Check collision
          if (
            projRect.left < answerRect.right &&
            projRect.right > answerRect.left &&
            projRect.top < answerRect.bottom &&
            projRect.bottom > answerRect.top
          ) {
            // Hit an answer
            const selectedAnswer = options[index];
            const correctAnswer = cards[currentCardIndex].back;
            
            if (selectedAnswer === correctAnswer) {
              // Correct answer
              setScore(prev => prev + 10);
              setProjectiles(prev => prev.filter(p => p.id !== projectile.id));
              
              // Move to next question
              const nextIndex = (currentCardIndex + 1) % cards.length;
              setCurrentCardIndex(nextIndex);
              generateOptions(cards, nextIndex);
            } else {
              // Incorrect answer
              setScore(prev => Math.max(0, prev - 5));
              setProjectiles(prev => prev.filter(p => p.id !== projectile.id));
            }
          }
        });
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameActive, projectiles, currentCardIndex, cards, options]);

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
        <div className="text-center p-8 max-w-md">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-300 hover:text-white"
          >
            <X className="w-5 h-5 mr-1" />
            Exit Game
          </button>
          <div className="flex items-center space-x-4">
            <button
              onClick={resetGame}
              className="flex items-center text-gray-300 hover:text-white"
            >
              <RotateCcw className="w-5 h-5 mr-1" />
              Reset
            </button>
            <div className="text-xl font-bold">Score: {score}</div>
          </div>
        </div>

        {!gameActive ? (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-6">Rocket Answer Game</h2>
            <p className="mb-8 text-gray-300 max-w-md mx-auto">
              Shoot the correct answers to the flashcard questions. Use your mouse to move
              and click to fire. You can also use arrow keys and spacebar.
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div 
            ref={gameAreaRef}
            className="relative bg-gray-800 rounded-lg overflow-hidden h-[70vh] w-full border-2 border-indigo-600"
          >
            {/* Current Question */}
            <div className="absolute top-8 left-0 right-0 text-center">
              <div className="bg-gray-700 inline-block px-6 py-3 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Question:</h3>
                <p className="text-2xl">{cards[currentCardIndex].front}</p>
              </div>
            </div>

            {/* Answer Options */}
            <div className="absolute top-32 left-0 right-0 flex justify-around px-4">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="answer-option bg-indigo-500 px-4 py-2 rounded-lg text-center shadow-lg transform hover:scale-105 transition-transform"
                >
                  {option}
                </div>
              ))}
            </div>

            {/* Projectiles */}
            {projectiles.map(projectile => (
              <div
                id={`proj-${projectile.id}`}
                key={projectile.id}
                className="absolute w-3 h-8 bg-yellow-300 rounded-full"
                style={{
                  left: `calc(${projectile.x}% - 6px)`,
                  bottom: `${100 - projectile.y}%`,
                }}
              ></div>
            ))}

            {/* Rocket/Player */}
            <div
              ref={rocketRef}
              className="absolute bottom-4 w-12 h-16"
              style={{ left: `calc(${rocketPosition}% - 24px)` }}
            >
              <div className="w-12 h-16 flex flex-col items-center">
                <div className="w-6 h-6 bg-red-500 rounded-full mb-1"></div>
                <div className="w-8 h-10 bg-gray-300 rounded-t-lg"></div>
                <div className="w-12 h-2 bg-gray-400 rounded-b-lg"></div>
                <div className="w-6 h-3 bg-orange-500 rounded-b-lg -mt-1"></div>
                <div className="w-4 h-4 bg-orange-600 rounded-full -mt-2"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 