import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

const GUEST_KEY = 'flashbear_guest';

function readGuest() {
  try {
    return localStorage.getItem(GUEST_KEY) === 'true';
  } catch {
    return false;
  }
}

interface AuthState {
  user: User | null;
  guest: boolean;
  setUser: (user: User | null) => void;
  continueAsGuest: () => void;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const unavailable = () =>
  new Error('Accounts are currently unavailable. Use "Continue without an account" instead.');

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  guest: readGuest(),
  setUser: (user) => set({ user }),
  continueAsGuest: () => {
    try {
      localStorage.setItem(GUEST_KEY, 'true');
    } catch {
      // ignore storage errors; guest mode still works for this session
    }
    set({ guest: true });
  },
  signUp: async (email: string, password: string) => {
    if (!supabase) throw unavailable();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  },
  signIn: async (email: string, password: string) => {
    if (!supabase) throw unavailable();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  signOut: async () => {
    try {
      localStorage.removeItem(GUEST_KEY);
    } catch {
      // ignore
    }
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Supabase may be unreachable; signing out locally is enough
      }
    }
    set({ user: null, guest: false });
  },
}));
