export interface Item {
  id: string;
  name: string;
  price: number;
  emoji: string;
  assignedTo: string[];
}

export interface Person {
  id: string;
  name: string;
  color: string;
  amountPaid: number;
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
  paid: boolean;
}

export interface Settings {
  routingMode: 'smart' | 'even';
  currency: string;
  currencySymbol: string;
}

export interface AppState {
  theme: 'sakura';
  receiptImage: string | null;
  items: Item[];
  tax: number;
  tip: number;
  people: Person[];
  settings: Settings;
  transactions: Transaction[];
  currentScreen: number;
}

export const PERSON_COLORS = [
  '#FFB3BA', // rose
  '#FFDFBA', // peach
  '#FFFFBA', // lemon
  '#d1f8d9', // mint
  '#BAE1FF', // sky
  '#D4BAFF', // lavender
  '#FFBAF5', // pink
  '#8ff1dc', // sage
];

export const EMOJI_MAP: Record<string, string> = {
  pizza: '🍕', burger: '🍔', fries: '🍟', pasta: '🍝', rice: '🍚',
  chicken: '🍗', fish: '🐟', sushi: '🍣', salad: '🥗', soup: '🍜',
  sandwich: '🥪', wrap: '🌯', steak: '🥩', egg: '🍳', waffle: '🧇',
  pancake: '🥞', bread: '🍞', cake: '🎂', icecream: '🍦', dessert: '🍮',
  cookie: '🍪', donut: '🍩', coffee: '☕', tea: '🍵', juice: '🧃',
  cola: '🥤', pepsi: '🥤', water: '💧', beer: '🍺', wine: '🍷',
  cocktail: '🍹', milkshake: '🥛', lemonade: '🍋', smoothie: '🥤',
  nachos: '🧀', wings: '🍗', ribs: '🍖', lobster: '🦞', shrimp: '🍤',
  default: '🍽️'
};

export const CURRENCIES: Record<string, { code: string; symbol: string; name: string }> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  PKR: { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
};

export function getEmoji(itemName: string): string {
  const lower = itemName.toLowerCase();
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (key !== 'default' && lower.includes(key)) {
      return emoji;
    }
  }
  return EMOJI_MAP.default;
}

export function generateId(): string {
  return crypto.randomUUID();
}
