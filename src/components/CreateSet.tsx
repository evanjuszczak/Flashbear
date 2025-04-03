import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Minus, Save, ArrowLeft, FileUp } from 'lucide-react';
import { useFlashcardStore } from '../store/flashcardStore';
import { ImportModal } from './ImportModal';
import { supabase } from '../lib/supabase';

export function CreateSet() {
  const navigate = useNavigate();
  const { setId } = useParams();
  const { createSet, createFlashcards } = useFlashcardStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState([{ front: '', back: '' }]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (setId) {
      setIsEditing(true);
      fetchSetData();
    }
  }, [setId]);

  const fetchSetData = async () => {
    try {
      // Fetch set details
      const { data: setData, error: setError } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', setId)
        .single();

      if (setError) throw setError;
      
      setTitle(setData.title || '');
      setDescription(setData.description || '');

      // Fetch cards for this set
      const { data: cardsData, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('created_at');

      if (cardsError) throw cardsError;
      
      if (cardsData.length > 0) {
        setCards(cardsData.map(card => ({ front: card.front, back: card.back })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flashcard set');
    }
  };

  const addCard = () => {
    setCards([...cards, { front: '', back: '' }]);
  };

  const removeCard = (index: number) => {
    if (cards.length > 1) {
      setCards(cards.filter((_, i) => i !== index));
    }
  };

  const updateCard = (index: number, field: 'front' | 'back', value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  const handleImport = (importedCards: { front: string; back: string }[]) => {
    setCards([...cards, ...importedCards]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!title.trim()) {
        throw new Error('Title is required');
      }

      if (cards.some(card => !card.front.trim() || !card.back.trim())) {
        throw new Error('All cards must have both front and back content');
      }

      if (isEditing && setId) {
        // Update existing set
        const { error: setError } = await supabase
          .from('flashcard_sets')
          .update({ title: title.trim(), description: description.trim() })
          .eq('id', setId);

        if (setError) throw setError;

        // Delete existing cards
        const { error: deleteError } = await supabase
          .from('flashcards')
          .delete()
          .eq('set_id', setId);

        if (deleteError) throw deleteError;

        // Create new cards
        const { error: cardsError } = await supabase
          .from('flashcards')
          .insert(cards.map(card => ({ 
            front: card.front.trim(), 
            back: card.back.trim(),
            set_id: setId 
          })));

        if (cardsError) throw cardsError;
      } else {
        // Create new set and cards
        const set = await createSet(title.trim(), description.trim());
        await createFlashcards(set.id, cards);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save flashcard set');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {isEditing ? 'Edit Flashcard Set' : 'Create New Flashbear Set'}
            </h2>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter set title"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter set description"
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Flashcards</h3>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FileUp className="w-4 h-4 mr-1" />
                  Import Data
                </button>
                <button
                  type="button"
                  onClick={addCard}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Card
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {cards.map((card, index) => (
                <div key={index} className="relative bg-gray-50 rounded-lg p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Front</label>
                      <textarea
                        value={card.front}
                        onChange={(e) => updateCard(index, 'front', e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Front of card"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Back</label>
                      <textarea
                        value={card.back}
                        onChange={(e) => updateCard(index, 'back', e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Back of card"
                      />
                    </div>
                  </div>
                  {cards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCard(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Update Flashcard Set' : 'Save Flashcard Set'}
            </button>
          </div>
        </form>
      </div>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}