import type { Transaction } from '../types';
import { roundToCents } from '../money';
import type { PersonBalance } from '../balances';

export function greedyRoute(balances: PersonBalance[]): Transaction[] {
  const transactions: Transaction[] = [];

  const debtors: { personId: string; amount: number }[] = [];
  const creditors: { personId: string; amount: number }[] = [];

  for (const b of balances) {
    if (b.balance < -0.01) {
      debtors.push({ personId: b.personId, amount: Math.abs(b.balance) });
    } else if (b.balance > 0.01) {
      creditors.push({ personId: b.personId, amount: b.balance });
    }
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.01) {
      transactions.push({
        from: debtor.personId,
        to: creditor.personId,
        amount: roundToCents(amount),
        paid: false,
      });
    }

    debtor.amount = roundToCents(debtor.amount - amount);
    creditor.amount = roundToCents(creditor.amount - amount);

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return transactions;
}
