import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { FlashcardSet, Flashcard } from '../types/database';

interface FlashcardState {
  sets: FlashcardSet[];
  currentSet: FlashcardSet | null;
  loading: boolean;
  error: string | null;
  fetchSets: () => Promise<void>;
  createSet: (title: string, description: string) => Promise<FlashcardSet>;
  createFlashcards: (setId: string, cards: { front: string; back: string }[]) => Promise<void>;
}

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
  sets: [],
  currentSet: null,
  loading: false,
  error: null,

  fetchSets: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ sets: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch flashcard sets' });
    } finally {
      set({ loading: false });
    }
  },

  createSet: async (title: string, description: string) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('flashcard_sets')
        .insert([{ 
          title, 
          description,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      set(state => ({ sets: [data, ...state.sets] }));
      return data;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create flashcard set' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createFlashcards: async (setId: string, cards: { front: string; back: string }[]) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Verify the set belongs to the user before adding cards
      const { data: setData, error: setError } = await supabase
        .from('flashcard_sets')
        .select('id')
        .eq('id', setId)
        .eq('user_id', user.id)
        .single();

      if (setError || !setData) throw new Error('Unauthorized to modify this set');

      const { error } = await supabase
        .from('flashcards')
        .insert(cards.map(card => ({ ...card, set_id: setId })));

      if (error) throw error;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create flashcards' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));