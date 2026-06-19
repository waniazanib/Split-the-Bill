import { describe, it, expect } from 'vitest';
import { greedyRoute } from './greedy';
import { evenRoute } from './even';
import type { PersonBalance } from '../balances';

// ── helpers ──────────────────────────────────────────────────────────────────

function bal(personId: string, paid: number, share: number): PersonBalance {
  return { personId, paid, share, balance: parseFloat((paid - share).toFixed(2)) };
}

function totalSettled(transactions: ReturnType<typeof greedyRoute>): number {
  return parseFloat(
    transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)
  );
}

function netAfterTransactions(
  balances: PersonBalance[],
  transactions: ReturnType<typeof greedyRoute>
): Map<string, number> {
  const net = new Map(balances.map((b) => [b.personId, b.balance]));
  for (const t of transactions) {
    net.set(t.from, parseFloat(((net.get(t.from) ?? 0) + t.amount).toFixed(2)));
    net.set(t.to,   parseFloat(((net.get(t.to)   ?? 0) - t.amount).toFixed(2)));
  }
  return net;
}

// ── greedyRoute ───────────────────────────────────────────────────────────────

describe('greedyRoute', () => {
  it('produces zero transactions when everyone is balanced', () => {
    const balances = [
      bal('alice', 30, 30),
      bal('bob',   30, 30),
    ];
    expect(greedyRoute(balances)).toHaveLength(0);
  });

  it('settles a simple two-person split', () => {
    // Alice paid $60, Bob paid $0 — each owes $30
    const balances = [
      bal('alice', 60, 30),
      bal('bob',    0, 30),
    ];
    const txns = greedyRoute(balances);
    expect(txns).toHaveLength(1);
    expect(txns[0]).toMatchObject({ from: 'bob', to: 'alice', amount: 30, paid: false });
  });

  it('settles a three-person dinner correctly', () => {
    // Alice paid $90 total; each person owes $30
    const balances = [
      bal('alice', 90,  30), // +60 surplus
      bal('bob',    0,  30), // -30 owes
      bal('carol',  0,  30), // -30 owes
    ];
    const txns = greedyRoute(balances);
    // Both bob and carol pay alice — at most 2 transactions
    expect(txns.length).toBeLessThanOrEqual(2);
    expect(totalSettled(txns)).toBe(60);

    // Every person ends up net-zero after the transactions
    const net = netAfterTransactions(balances, txns);
    for (const v of net.values()) {
      expect(Math.abs(v)).toBeLessThanOrEqual(0.01);
    }
  });

  it('minimises transaction count (greedy property)', () => {
    // 4 people, 1 payer — greedy should need exactly 3 transactions
    const balances = [
      bal('alice', 100, 25),
      bal('bob',     0, 25),
      bal('carol',   0, 25),
      bal('dave',    0, 25),
    ];
    const txns = greedyRoute(balances);
    expect(txns.length).toBeLessThanOrEqual(3);
    expect(totalSettled(txns)).toBe(75);
  });

  it('handles uneven splits', () => {
    // Alice paid $70, bob owes $50, carol owes $20
    const balances = [
      bal('alice',  70, 0),
      bal('bob',    0, 50),
      bal('carol',  0, 20),
    ];
    const txns = greedyRoute(balances);
    expect(totalSettled(txns)).toBe(70);

    const net = netAfterTransactions(balances, txns);
    for (const v of net.values()) {
      expect(Math.abs(v)).toBeLessThanOrEqual(0.01);
    }
  });

  it('handles multiple creditors and debtors', () => {
    // Alice +40, Bob +10, Carol -30, Dave -20
    const balances = [
      bal('alice', 70, 30),
      bal('bob',   40, 30),
      bal('carol',  0, 30),
      bal('dave',  10, 30),
    ];
    const txns = greedyRoute(balances);
    expect(totalSettled(txns)).toBe(50); // total debt is 50

    const net = netAfterTransactions(balances, txns);
    for (const v of net.values()) {
      expect(Math.abs(v)).toBeLessThanOrEqual(0.01);
    }
  });

  it('all transactions start as unpaid', () => {
    const balances = [
      bal('alice', 50, 25),
      bal('bob',    0, 25),
    ];
    const txns = greedyRoute(balances);
    expect(txns.every((t) => t.paid === false)).toBe(true);
  });

  it('amounts are rounded to 2 decimal places', () => {
    const balances = [
      bal('alice', 100 / 3, 0),
      bal('bob',    0,  100 / 3),
      bal('carol',  0,  100 / 3),
    ];
    const txns = greedyRoute(balances);
    for (const t of txns) {
      const str = t.amount.toString();
      const decimals = str.includes('.') ? str.split('.')[1].length : 0;
      expect(decimals).toBeLessThanOrEqual(2);
    }
  });
});

// ── evenRoute ────────────────────────────────────────────────────────────────

describe('evenRoute', () => {
  it('produces zero transactions when everyone is balanced', () => {
    const balances = [
      bal('alice', 30, 30),
      bal('bob',   30, 30),
    ];
    expect(evenRoute(balances)).toHaveLength(0);
  });

  it('settles a simple two-person split', () => {
    const balances = [
      bal('alice', 60, 30),
      bal('bob',    0, 30),
    ];
    const txns = evenRoute(balances);
    expect(txns).toHaveLength(1);
    expect(txns[0]).toMatchObject({ from: 'bob', to: 'alice', amount: 30, paid: false });
  });

  it('total settled equals total debt', () => {
    const balances = [
      bal('alice', 90, 30),
      bal('bob',    0, 30),
      bal('carol',  0, 30),
    ];
    const txns = evenRoute(balances);
    expect(totalSettled(txns)).toBe(60);
  });

  it('all transactions start as unpaid', () => {
    const balances = [
      bal('alice', 50, 25),
      bal('bob',    0, 25),
    ];
    const txns = evenRoute(balances);
    expect(txns.every((t) => t.paid === false)).toBe(true);
  });

  it('splits debt proportionally across multiple creditors', () => {
    // Two creditors: alice +30, bob +10; carol owes 40 total
    const balances = [
      bal('alice', 60, 30), // +30
      bal('bob',   40, 30), // +10
      bal('carol',  0, 40), // -40
    ];
    const txns = evenRoute(balances);
    expect(totalSettled(txns)).toBe(40);

    // carol should pay both alice and bob (proportional to their surplus)
    const carolTxns = txns.filter((t) => t.from === 'carol');
    expect(carolTxns.length).toBeGreaterThanOrEqual(1);
  });
});

// ── greedy vs even comparison ────────────────────────────────────────────────

describe('greedyRoute vs evenRoute', () => {
  it('greedy produces fewer or equal transactions than even for 4-person scenario', () => {
    const balances = [
      bal('alice', 100, 25),
      bal('bob',     0, 25),
      bal('carol',   0, 25),
      bal('dave',    0, 25),
    ];
    const greedy = greedyRoute(balances);
    const even   = evenRoute(balances);
    expect(greedy.length).toBeLessThanOrEqual(even.length);
  });

  it('both algorithms settle the same total amount', () => {
    const balances = [
      bal('alice', 80, 20),
      bal('bob',    0, 30),
      bal('carol',  0, 30),
    ];
    const greedyTotal = totalSettled(greedyRoute(balances));
    const evenTotal   = totalSettled(evenRoute(balances));
    expect(greedyTotal).toBeCloseTo(evenTotal, 2);
  });
});
