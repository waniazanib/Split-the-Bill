import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';

export default function Screen4() {
  const { state, dispatch, formatMoney, totalBill } = useApp();
  const [nameInput, setNameInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAddPerson = () => {
    const name = nameInput.trim();
    if (name) {
      dispatch({ type: 'ADD_PERSON', payload: name });
      setNameInput('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPerson();
    }
  };

  const handleContinue = () => {
    if (state.people.length >= 2) {
      dispatch({ type: 'SET_SCREEN', payload: 5 });
    }
  };

  return (
    <div
      className="screen container flex flex-col"
      style={{
        maxWidth: '1200px',
        width: '100%',
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 24px',
      }}
    >
      <style>{`
        .custom-remove-btn {
          width: 18px;
          height: 18px;
          font-size: 0.65rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.06);
          color: rgba(0, 0, 0, 0.45);
          transition: all 150ms ease;
          margin-left: 6px;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        .custom-remove-btn:hover {
          background: rgba(0, 0, 0, 0.15);
          color: rgba(0, 0, 0, 0.8);
        }
      `}</style>

      {/* Header: centered */}
      <div className="header" style={{ justifyContent: 'center', width: '100%', marginBottom: '32px' }}>
        <button
          className="header-back"
          onClick={() => dispatch({ type: 'SET_SCREEN', payload: 3 })}
          style={{ marginRight: '8px' }}
        >
          ←
        </button>
        <h2 className="header-title" style={{ margin: 0 }}>Who's splitting?</h2>
      </div>

      {/* Input section: centered and limited width */}
      <div className="flex gap-sm mb-lg" style={{ width: '100%', maxWidth: '420px', justifyContent: 'center' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter a name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input flex-1"
          style={{ borderRadius: '16px' }}
        />
        <button
          className="btn btn-primary"
          onClick={handleAddPerson}
          disabled={!nameInput.trim()}
          style={{
            width: '52px',
            height: '52px',
            padding: 0,
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          ✓
        </button>
      </div>

      {/* Chips section: centered, wraps, expands vertically when needed */}
      <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
        {state.people.length > 0 ? (
          <div className="flex justify-center gap-sm" style={{ width: '100%', flexWrap: 'wrap' }}>
            {state.people.map((person) => (
              <div
                key={person.id}
                className="chip"
                style={{
                  background: person.color,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  margin: '4px',
                }}
              >
                <span style={{ textTransform: 'lowercase' }}>{person.name}</span>
                <button
                  className="custom-remove-btn"
                  onClick={() => dispatch({ type: 'REMOVE_PERSON', payload: person.id })}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state mb-lg">
            <p className="text-muted">Add at least 2 people to split the bill</p>
          </div>
        )}
      </div>

      {/* Under chips: feedback if < 2 people */}
      {state.people.length > 0 && state.people.length < 2 && (
        <p className="text-sm text-muted text-center mb-md" style={{ marginBottom: '24px' }}>
          Add at least {2 - state.people.length} more person{2 - state.people.length > 1 ? 's' : ''}
        </p>
      )}

      {/* Summary section */}
      <div className="text-center" style={{ marginBottom: '16px' }}>
        <span className="text-muted text-sm">
          {state.people.length} people splitting {formatMoney(totalBill())}
        </span>
      </div>

      {/* Action button: centered, pill-shaped, limited width */}
      <button
        className="btn btn-primary btn-large"
        onClick={handleContinue}
        disabled={state.people.length < 2}
        style={{
          width: '100%',
          maxWidth: '360px',
          borderRadius: '24px',
          justifyContent: 'center',
        }}
      >
        Assign items →
      </button>
    </div>
  );
}
