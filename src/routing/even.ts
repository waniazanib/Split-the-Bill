import type { Transaction } from '../types';
import { roundToCents } from '../money';
import type { PersonBalance } from '../balances';

export function evenRoute(balances: PersonBalance[]): Transaction[] {
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

  for (const debtor of debtors) {
    for (const creditor of creditors) {
      if (creditor.amount < 0.01) continue;

      const debtorTotal = debtor.amount;
      const creditorRemaining = creditor.amount;

      const proportionalShare = roundToCents(
        Math.min(debtorTotal, creditorRemaining)
      );

      if (proportionalShare > 0.01) {
        transactions.push({
          from: debtor.personId,
          to: creditor.personId,
          amount: proportionalShare,
          paid: false,
        });

        creditor.amount = roundToCents(creditor.amount - proportionalShare);
      }
    }
  }

  return transactions;
}
