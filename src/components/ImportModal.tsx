import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (cards: { front: string; back: string }[]) => void;
}

type Delimiter = 'tab' | 'comma' | 'dash' | 'newline';
type CardDelimiter = 'newline' | 'semicolon' | 'doubleline';

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [rawInput, setRawInput] = useState('');
  const [delimiter, setDelimiter] = useState<Delimiter>('tab');
  const [cardDelimiter, setCardDelimiter] = useState<CardDelimiter>('newline');
  const [preview, setPreview] = useState<{ front: string; back: string }[]>([]);

  useEffect(() => {
    if (rawInput) {
      const cards = parseInput(rawInput, delimiter, cardDelimiter);
      setPreview(cards);
    } else {
      setPreview([]);
    }
  }, [rawInput, delimiter, cardDelimiter]);

  const parseInput = (input: string, termDelimiter: Delimiter, cardDelim: CardDelimiter): { front: string; back: string }[] => {
    const cards: { front: string; back: string }[] = [];
    
    // Normalize line endings
    const normalizedInput = input.replace(/\r\n/g, '\n');
    
    // First split by card delimiter
    let cardTexts: string[] = [];
    if (cardDelim === 'doubleline') {
      cardTexts = normalizedInput.split('\n\n').filter(text => text.trim());
    } else if (cardDelim === 'semicolon') {
      cardTexts = normalizedInput.split(';').filter(text => text.trim());
    } else {
      cardTexts = normalizedInput.split('\n').filter(text => text.trim());
    }

    for (const cardText of cardTexts) {
      if (!cardText.trim()) continue;

      let front = '', back = '';
      const trimmedText = cardText.trim();

      if (termDelimiter === 'tab') {
        const parts = trimmedText.split('\t');
        if (parts.length >= 2) {
          front = parts[0];
          back = parts.slice(1).join('\t'); // Join remaining parts in case of multiple tabs
        }
      } else if (termDelimiter === 'comma') {
        const parts = trimmedText.split(',');
        if (parts.length >= 2) {
          front = parts[0];
          back = parts.slice(1).join(','); // Join remaining parts in case of multiple commas
        }
      } else if (termDelimiter === 'dash') {
        const dashIndex = trimmedText.indexOf('-');
        if (dashIndex !== -1) {
          front = trimmedText.slice(0, dashIndex);
          back = trimmedText.slice(dashIndex + 1);
        }
      } else if (termDelimiter === 'newline') {
        const lines = trimmedText.split('\n').filter(line => line.trim());
        if (lines.length >= 2) {
          front = lines[0];
          back = lines.slice(1).join('\n');
        }
      }

      if (front?.trim() && back?.trim()) {
        cards.push({
          front: front.trim(),
          back: back.trim()
        });
      }
    }

    return cards;
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      onClose();
      setRawInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Import your data</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Copy and Paste your data here (from Word, Excel, Google Docs, etc.)
            </label>
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              className="w-full h-40 p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholder="Term 1&#9;Definition 1&#10;Term 2&#9;Definition 2&#10;Term 3&#9;Definition 3&#10;&#10;Tip: Press Tab between term and definition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Between term and definition
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={delimiter === 'tab'}
                    onChange={() => setDelimiter('tab')}
                    className="mr-2"
                  />
                  Tab
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={delimiter === 'comma'}
                    onChange={() => setDelimiter('comma')}
                    className="mr-2"
                  />
                  Comma
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={delimiter === 'dash'}
                    onChange={() => setDelimiter('dash')}
                    className="mr-2"
                  />
                  Dash (-)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={delimiter === 'newline'}
                    onChange={() => setDelimiter('newline')}
                    className="mr-2"
                  />
                  New line
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Between cards
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={cardDelimiter === 'newline'}
                    onChange={() => setCardDelimiter('newline')}
                    className="mr-2"
                  />
                  New line
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={cardDelimiter === 'semicolon'}
                    onChange={() => setCardDelimiter('semicolon')}
                    className="mr-2"
                  />
                  Semicolon
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={cardDelimiter === 'doubleline'}
                    onChange={() => setCardDelimiter('doubleline')}
                    className="mr-2"
                  />
                  Double line
                </label>
              </div>
            </div>
          </div>

          {preview.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Preview ({preview.length} cards)</h3>
              <div className="max-h-60 overflow-y-auto border rounded-md p-4 space-y-2">
                {preview.map((card, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 p-2 bg-gray-50 rounded">
                    <div>{card.front}</div>
                    <div>{card.back}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel Import
            </button>
            <button
              onClick={handleImport}
              disabled={preview.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 