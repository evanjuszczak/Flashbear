import { create } from 'zustand';
import * as localDb from '../lib/localDb';
import type { FlashcardSet } from '../types/database';

interface FlashcardState {
  sets: FlashcardSet[];
  currentSet: FlashcardSet | null;
  loading: boolean;
  error: string | null;
  fetchSets: () => Promise<void>;
  createSet: (title: string, description: string) => Promise<FlashcardSet>;
  createFlashcards: (setId: string, cards: { front: string; back: string }[]) => Promise<void>;
  deleteSet: (setId: string) => Promise<void>;
}

export const useFlashcardStore = create<FlashcardState>((set) => ({
  sets: [],
  currentSet: null,
  loading: false,
  error: null,

  fetchSets: async () => {
    try {
      set({ sets: localDb.getSets(), error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch flashcard sets' });
    }
  },

  createSet: async (title: string, description: string) => {
    try {
      const newSet = localDb.createSet(title, description);
      set(state => ({ sets: [newSet, ...state.sets], error: null }));
      return newSet;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create flashcard set' });
      throw error;
    }
  },

  createFlashcards: async (setId: string, cards: { front: string; back: string }[]) => {
    try {
      if (!localDb.getSet(setId)) throw new Error('Flashcard set not found');
      localDb.addCards(setId, cards);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create flashcards' });
      throw error;
    }
  },

  deleteSet: async (setId: string) => {
    localDb.deleteSet(setId);
    set(state => ({ sets: state.sets.filter(s => s.id !== setId) }));
  },
}));
