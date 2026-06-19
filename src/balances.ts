import type { Item, Person } from './types';
import { roundToCents } from './money';

export interface PersonBalance {
  personId: string;
  share: number;
  paid: number;
  balance: number;
}

export function calculateItemSplit(item: Item, _itemCount?: number): number {
  if (item.assignedTo.length === 0) return 0;
  return roundToCents(item.price / item.assignedTo.length);
}

export function calculatePersonShares(
  items: Item[],
  tax: number,
  tip: number
): Map<string, number> {
  const shares = new Map<string, number>();

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const totalWithExtras = subtotal + tax + tip;
  const multiplier = totalWithExtras / (subtotal || 1);

  for (const item of items) {
    if (item.assignedTo.length === 0) continue;

    const adjustedPrice = roundToCents(item.price * multiplier);
    const perPerson = roundToCents(adjustedPrice / item.assignedTo.length);

    for (const personId of item.assignedTo) {
      const current = shares.get(personId) || 0;
      shares.set(personId, roundToCents(current + perPerson));
    }
  }

  return shares;
}

export function calculateBalances(
  items: Item[],
  people: Person[],
  tax: number,
  tip: number
): PersonBalance[] {
  const shares = calculatePersonShares(items, tax, tip);
  const payments = new Map<string, number>();

  for (const person of people) {
    payments.set(person.id, person.amountPaid);
  }

  const balances: PersonBalance[] = [];

  for (const person of people) {
    const share = shares.get(person.id) || 0;
    const paid = payments.get(person.id) || 0;
    const balance = roundToCents(paid - share);

    balances.push({
      personId: person.id,
      share,
      paid,
      balance,
    });
  }

  return balances;
}

export function getTotalPaid(people: Person[]): number {
  return roundToCents(people.reduce((sum, p) => sum + p.amountPaid, 0));
}

export function getSubtotal(items: Item[]): number {
  return roundToCents(items.reduce((sum, item) => sum + item.price, 0));
}

export function getTotal(items: Item[], tax: number, tip: number): number {
  return roundToCents(getSubtotal(items) + tax + tip);
}
