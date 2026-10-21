import type { FlashcardSet, Flashcard } from '../types/database';

// All data lives in the browser's localStorage (Supabase is no longer active).
const SETS_KEY = 'flashbear_sets';
const CARDS_KEY = 'flashbear_cards';
export const LOCAL_USER_ID = 'local-user';

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getSets(): FlashcardSet[] {
  return read<FlashcardSet>(SETS_KEY).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getSet(id: string): FlashcardSet | null {
  return read<FlashcardSet>(SETS_KEY).find(s => s.id === id) ?? null;
}

export function createSet(title: string, description: string): FlashcardSet {
  const now = new Date().toISOString();
  const set: FlashcardSet = {
    id: newId(),
    user_id: LOCAL_USER_ID,
    title,
    description,
    created_at: now,
    updated_at: now,
  };
  write(SETS_KEY, [set, ...read<FlashcardSet>(SETS_KEY)]);
  return set;
}

export function updateSet(id: string, fields: { title: string; description: string }) {
  const now = new Date().toISOString();
  write(
    SETS_KEY,
    read<FlashcardSet>(SETS_KEY).map(s => (s.id === id ? { ...s, ...fields, updated_at: now } : s))
  );
}

export function deleteSet(id: string) {
  write(SETS_KEY, read<FlashcardSet>(SETS_KEY).filter(s => s.id !== id));
  write(CARDS_KEY, read<Flashcard>(CARDS_KEY).filter(c => c.set_id !== id));
}

export function getCards(setId: string): Flashcard[] {
  return read<Flashcard>(CARDS_KEY)
    .filter(c => c.set_id === setId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function addCards(setId: string, cards: { front: string; back: string }[]) {
  const base = Date.now();
  // Offset timestamps so cards keep their order when sorted by created_at
  const created = cards.map((card, i) => {
    const ts = new Date(base + i).toISOString();
    return { id: newId(), set_id: setId, front: card.front, back: card.back, created_at: ts, updated_at: ts };
  });
  write(CARDS_KEY, [...read<Flashcard>(CARDS_KEY), ...created]);
}

export function replaceCards(setId: string, cards: { front: string; back: string }[]) {
  write(CARDS_KEY, read<Flashcard>(CARDS_KEY).filter(c => c.set_id !== setId));
  addCards(setId, cards);
}
