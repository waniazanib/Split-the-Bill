import { useState } from 'react';
import { useApp } from '../AppContext';
import type { Item } from '../types';
import { generateId, getEmoji, EMOJI_MAP } from '../types';
import { getSubtotal } from '../balances';

function EmojiPicker({
  onSelect,
  onClose,
}: {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}) {
  const emojis = Object.values(EMOJI_MAP).filter((e) => e !== EMOJI_MAP.default);

  return (
    <div
      className="emoji-picker"
      onBlur={onClose}
      tabIndex={-1}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          className="emoji-option"
          onClick={() => {
            onSelect(emoji);
            onClose();
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

function ItemRow({
  item,
  onUpdate,
  onDelete,
  formatMoney,
}: {
  item: Item;
  onUpdate: (item: Item) => void;
  onDelete: () => void;
  formatMoney: (amount: number) => string;
}) {
  const [editingEmoji, setEditingEmoji] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [nameValue, setNameValue] = useState(item.name);
  const [priceValue, setPriceValue] = useState(item.price.toString());

  const handleNameSave = () => {
    const trimmed = nameValue.trim();
    if (trimmed) {
      onUpdate({ ...item, name: trimmed, emoji: getEmoji(trimmed) });
    }
    setEditingName(false);
  };

  const handlePriceSave = () => {
    const parsed = parseFloat(priceValue);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdate({ ...item, price: parsed });
    }
    setEditingPrice(false);
  };

  return (
    <div className="item-row">
      <div style={{ position: 'relative' }}>
        <button
          className="emoji-btn"
          onClick={() => setEditingEmoji(!editingEmoji)}
          style={{
            fontSize: '1.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {item.emoji}
        </button>
        {editingEmoji && (
          <EmojiPicker
            onSelect={(emoji) => onUpdate({ ...item, emoji })}
            onClose={() => setEditingEmoji(false)}
          />
        )}
      </div>

      <div className="flex-1">
        {editingName ? (
          <input
            type="text"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
            className="input input-handwritten"
            autoFocus
          />
        ) : (
          <button
            onClick={() => {
              setEditingName(true);
              setNameValue(item.name);
            }}
            className="font-handwritten"
            style={{
              fontSize: '1.25rem',
              background: 'none',
              border: 'none',
              cursor: 'text',
              color: 'inherit',
            }}
          >
            {item.name}
          </button>
        )}
      </div>

      <div>
        {editingPrice ? (
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={priceValue}
            onChange={(e) => setPriceValue(e.target.value)}
            onBlur={handlePriceSave}
            onKeyDown={(e) => e.key === 'Enter' && handlePriceSave()}
            style={{ width: '80px' }}
            className="input"
            autoFocus
          />
        ) : (
          <button
            onClick={() => {
              setEditingPrice(true);
              setPriceValue(item.price.toString());
            }}
            className="font-handwritten"
            style={{
              fontSize: '1.25rem',
              background: 'none',
              border: 'none',
              cursor: 'text',
              color: 'inherit',
            }}
          >
            {formatMoney(item.price)}
          </button>
        )}
      </div>

      <button className="remove-btn" onClick={onDelete}>
        🗑
      </button>
    </div>
  );
}

export default function Screen3() {
  const { state, dispatch, formatMoney } = useApp();
  const [showTaxTip, setShowTaxTip] = useState(state.tax > 0 || state.tip > 0);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  const subtotal = getSubtotal(state.items);

  const handleAddItem = () => {
    const name = newItemName.trim();
    const price = parseFloat(newItemPrice);

    if (!name || isNaN(price) || price < 0) return;

    const newItem: Item = {
      id: generateId(),
      name,
      price,
      emoji: getEmoji(name),
      assignedTo: [],
    };

    dispatch({ type: 'ADD_ITEM', payload: newItem });
    setNewItemName('');
    setNewItemPrice('');
    setIsAddingItem(false);
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_SCREEN', payload: 4 });
  };

  const canContinue = state.items.length > 0;

  return (
    <div className="screen container flex flex-col">
      <div className="header">
        <button
          className="header-back"
          onClick={() => dispatch({ type: 'SET_SCREEN', payload: 1 })}
        >
          ←
        </button>
        <h2 className="header-title">Edit Items</h2>
      </div>

      <div className="receipt-card flex-1">
        <h3
          className="font-handwritten text-center mb-lg"
          style={{ fontSize: '1.5rem' }}
        >
          Receipt
        </h3>

        {state.items.length === 0 ? (
          <div className="empty-state">
            <p>No items yet. Add your first item!</p>
          </div>
        ) : (
          state.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onUpdate={(updated) =>
                dispatch({ type: 'UPDATE_ITEM', payload: updated })
              }
              onDelete={() => dispatch({ type: 'DELETE_ITEM', payload: item.id })}
              formatMoney={formatMoney}
            />
          ))
        )}

        {isAddingItem && (
          <div className="item-row" style={{ background: 'rgba(255,255,255,0.5)' }}>
            <span style={{ fontSize: '1.5rem' }}>🍽️</span>
            <input
              type="text"
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="input input-handwritten flex-1"
              autoFocus
            />
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0.00"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              style={{ width: '80px' }}
              className="input"
            />
            <button
              className="btn btn-primary"
              style={{ padding: '8px 16px' }}
              onClick={handleAddItem}
            >
              ✓
            </button>
            <button
              className="btn btn-ghost"
              style={{ padding: '8px' }}
              onClick={() => setIsAddingItem(false)}
            >
              ✕
            </button>
          </div>
        )}

        {!isAddingItem && (
          <button
            className="btn btn-secondary w-full mt-md"
            onClick={() => setIsAddingItem(true)}
          >
            + Add item
          </button>
        )}

        <div className="divider" />

        {!showTaxTip ? (
          <button
            className="btn btn-ghost w-full text-sm"
            onClick={() => setShowTaxTip(true)}
          >
            + Add tax/tip
          </button>
        ) : (
          <div className="gap-md flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-muted">Tax:</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={state.tax || ''}
                onChange={(e) =>
                  dispatch({ type: 'SET_TAX', payload: parseFloat(e.target.value) || 0 })
                }
                placeholder="0.00"
                style={{ width: '100px' }}
                className="input"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Tip:</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={state.tip || ''}
                onChange={(e) =>
                  dispatch({ type: 'SET_TIP', payload: parseFloat(e.target.value) || 0 })
                }
                placeholder="0.00"
                style={{ width: '100px' }}
                className="input"
              />
            </div>
          </div>
        )}

        <div className="divider" />

        <div className="flex items-center justify-between">
          <span className="font-bold">Subtotal:</span>
          <span className="font-bold">{formatMoney(subtotal)}</span>
        </div>
        {(state.tax > 0 || state.tip > 0) && (
          <>
            {state.tax > 0 && (
              <div className="flex items-center justify-between text-muted text-sm">
                <span>Tax:</span>
                <span>{formatMoney(state.tax)}</span>
              </div>
            )}
            {state.tip > 0 && (
              <div className="flex items-center justify-between text-muted text-sm">
                <span>Tip:</span>
                <span>{formatMoney(state.tip)}</span>
              </div>
            )}
          </>
        )}
        <div
          className="flex items-center justify-between mt-md"
          style={{ fontSize: '1.25rem' }}
        >
          <span className="font-bold">Total:</span>
          <span className="font-bold">{formatMoney(subtotal + state.tax + state.tip)}</span>
        </div>
      </div>

      <button
        className="btn btn-primary btn-large mt-lg"
        onClick={handleContinue}
        disabled={!canContinue}
      >
        Looks good →
      </button>
    </div>
  );
}
