import { useEffect, useState } from 'react';
import Tesseract from 'tesseract.js';
import { useApp } from '../AppContext';
import type { Item } from '../types';
import { generateId, getEmoji } from '../types';

function extractItems(rawText: string): Omit<Item, 'id'>[] {
  const lines = rawText.split('\n').filter((l) => l.trim());
  const items: Omit<Item, 'id'>[] = [];

  const priceRegex = /^(.+?)\s+\$?([\d,]+\.?\d{0,2})\s*$/;

  for (const line of lines) {
    const match = line.match(priceRegex);
    if (match) {
      const price = parseFloat(match[2].replace(',', ''));
      if (price > 0 && price < 100000) {
        const name = match[1].trim();
        items.push({
          name,
          price,
          emoji: getEmoji(name),
          assignedTo: [],
        });
      }
    }
  }

  return items;
}

export default function Screen2() {
  const { state, dispatch } = useApp();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.receiptImage) {
      dispatch({ type: 'SET_SCREEN', payload: 3 });
      return;
    }

    const parseReceipt = async () => {
      try {
        const result = await Tesseract.recognize(state.receiptImage!, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          },
        });

        const extractedItems = extractItems(result.data.text);

        if (extractedItems.length === 0) {
          setError("Hmm, couldn't read this one. Let's enter items manually!");
        } else {
          const items: Item[] = extractedItems.map((item) => ({
            ...item,
            id: generateId(),
          }));
          dispatch({ type: 'SET_ITEMS', payload: items });
          dispatch({ type: 'SET_SCREEN', payload: 3 });
        }
      } catch {
        setError("Hmm, couldn't read this one. Let's enter items manually!");
      }
    };

    parseReceipt();
  }, [state.receiptImage, dispatch]);

  const handleManualEntry = () => {
    dispatch({ type: 'SET_SCREEN', payload: 3 });
  };

  if (error) {
    return (
      <div
        className="screen container flex flex-col items-center justify-center"
        style={{ minHeight: '100vh' }}
      >
        <div className="flex flex-col items-center text-center" style={{ gap: '32px' }}>
          <p style={{ color: '#761626', fontSize: '1.125rem' }}>{error}</p>
          <button
            onClick={handleManualEntry}
            style={{
              padding: '12px 32px',
              borderRadius: '50px',
              border: '3px solid #c25164',
              background: '#f5dce1',
              color: '#761626',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              minWidth: '180px',
            }}
          >
            Add Items Manually
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="screen container flex flex-col items-center justify-center"
      style={{ minHeight: '100vh' }}
    >
      <div className="flex flex-col items-center text-center" style={{ gap: '32px' }}>
        <p
          style={{
            fontFamily: "'Segoe Script', cursive",
            fontSize: '1.5rem',
            color: '#761626',
          }}
        >
          Reading your receipt...
        </p>

        <div
          style={{
            width: '300px',
            height: '12px',
            background: '#f5dce1',
            borderRadius: '50px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: '#c25164',
              borderRadius: '50px',
              transition: 'width 300ms ease',
            }}
          />
        </div>

        <p style={{ color: '#761626', fontSize: '0.875rem' }}>{progress}%</p>
      </div>
    </div>
  );
}
