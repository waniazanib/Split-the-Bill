import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { AppState, Item, Person, Settings, Transaction } from './types';
import { PERSON_COLORS, CURRENCIES, generateId } from './types';
import { calculateBalances, getTotal, getTotalPaid } from './balances';
import { greedyRoute, evenRoute } from './routing';

const STORAGE_KEY = 'split-the-bill-state';

const defaultSettings: Settings = {
  routingMode: 'smart',
  currency: 'USD',
  currencySymbol: '$',
};

const initialState: AppState = {
  theme: 'sakura',
  receiptImage: null,
  items: [],
  tax: 0,
  tip: 0,
  people: [],
  settings: defaultSettings,
  transactions: [],
  currentScreen: 1,
};

type Action =
  | { type: 'SET_RECEIPT_IMAGE'; payload: string | null }
  | { type: 'SET_ITEMS'; payload: Item[] }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'UPDATE_ITEM'; payload: Item }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'SET_TAX'; payload: number }
  | { type: 'SET_TIP'; payload: number }
  | { type: 'ADD_PERSON'; payload: string }
  | { type: 'REMOVE_PERSON'; payload: string }
  | { type: 'UPDATE_PERSON_PAID'; payload: { id: string; amount: number } }
  | { type: 'ASSIGN_ITEM'; payload: { itemId: string; personId: string } }
  | { type: 'UNASSIGN_ITEM'; payload: { itemId: string; personId: string } }
  | { type: 'ASSIGN_ALL_TO_ITEM'; payload: { itemId: string } }
  | { type: 'SET_ROUTING_MODE'; payload: 'smart' | 'even' }
  | { type: 'SET_CURRENCY'; payload: string }
  | { type: 'CALCULATE_TRANSACTIONS' }
  | { type: 'TOGGLE_TRANSACTION_PAID'; payload: number }
  | { type: 'SET_SCREEN'; payload: number }
  | { type: 'RESET' }
  | { type: 'RESTORE'; payload: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_RECEIPT_IMAGE':
      return { ...state, receiptImage: action.payload };

    case 'SET_ITEMS':
      return { ...state, items: action.payload };

    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };

    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case 'SET_TAX':
      return { ...state, tax: Math.max(0, action.payload) };

    case 'SET_TIP':
      return { ...state, tip: Math.max(0, action.payload) };

    case 'ADD_PERSON': {
      const name = action.payload.trim();
      if (!name) return state;
      const existingNames = state.people.map((p) => p.name.toLowerCase());
      if (existingNames.includes(name.toLowerCase())) return state;

      const newPerson: Person = {
        id: generateId(),
        name,
        color: PERSON_COLORS[state.people.length % PERSON_COLORS.length],
        amountPaid: 0,
      };
      return { ...state, people: [...state.people, newPerson] };
    }

    case 'REMOVE_PERSON': {
      const personId = action.payload;
      return {
        ...state,
        people: state.people.filter((p) => p.id !== personId),
        items: state.items.map((item) => ({
          ...item,
          assignedTo: item.assignedTo.filter((id) => id !== personId),
        })),
      };
    }

    case 'UPDATE_PERSON_PAID':
      return {
        ...state,
        people: state.people.map((p) =>
          p.id === action.payload.id
            ? { ...p, amountPaid: Math.max(0, action.payload.amount) }
            : p
        ),
      };

    case 'ASSIGN_ITEM': {
      const { itemId, personId } = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === itemId && !item.assignedTo.includes(personId)
            ? { ...item, assignedTo: [...item.assignedTo, personId] }
            : item
        ),
      };
    }

    case 'UNASSIGN_ITEM': {
      const { itemId, personId } = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === itemId
            ? { ...item, assignedTo: item.assignedTo.filter((id) => id !== personId) }
            : item
        ),
      };
    }

    case 'ASSIGN_ALL_TO_ITEM': {
      const { itemId } = action.payload;
      const allPersonIds = state.people.map((p) => p.id);
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === itemId ? { ...item, assignedTo: allPersonIds } : item
        ),
      };
    }

    case 'SET_ROUTING_MODE':
      return {
        ...state,
        settings: { ...state.settings, routingMode: action.payload },
      };

    case 'SET_CURRENCY': {
      const currency = CURRENCIES[action.payload] || CURRENCIES.USD;
      return {
        ...state,
        settings: {
          ...state.settings,
          currency: currency.code,
          currencySymbol: currency.symbol,
        },
      };
    }

    case 'CALCULATE_TRANSACTIONS': {
      const balances = calculateBalances(state.items, state.people, state.tax, state.tip);
      const transactions: Transaction[] =
        state.settings.routingMode === 'smart'
          ? greedyRoute(balances)
          : evenRoute(balances);
      return { ...state, transactions };
    }

    case 'TOGGLE_TRANSACTION_PAID':
      return {
        ...state,
        transactions: state.transactions.map((t, i) =>
          i === action.payload ? { ...t, paid: !t.paid } : t
        ),
      };

    case 'SET_SCREEN':
      return { ...state, currentScreen: action.payload };

    case 'RESET':
      return initialState;

    case 'RESTORE':
      return action.payload;

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  formatMoney: (amount: number) => string;
  allItemsAssigned: () => boolean;
  totalPaid: () => number;
  totalBill: () => number;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'RESTORE', payload: { ...initialState, ...parsed } });
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const formatMoney = (amount: number): string => {
    return `${state.settings.currencySymbol}${amount.toFixed(2)}`;
  };

  const allItemsAssigned = (): boolean => {
    return state.items.every((item) => item.assignedTo.length > 0);
  };

  const totalPaid = (): number => getTotalPaid(state.people);

  const totalBill = (): number => getTotal(state.items, state.tax, state.tip);

  return (
    <AppContext.Provider
      value={{ state, dispatch, formatMoney, allItemsAssigned, totalPaid, totalBill }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
