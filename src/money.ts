export function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function formatMoney(amount: number, symbol: string): string {
  return `${symbol}${roundToCents(amount).toFixed(2)}`;
}

export function distributePercent(total: number, percentages: number[]): number[] {
  const results: number[] = [];
  let remaining = roundToCents(total);

  for (let i = 0; i < percentages.length; i++) {
    if (i === percentages.length - 1) {
      results.push(roundToCents(remaining));
    } else {
      const share = roundToCents(total * percentages[i]);
      results.push(share);
      remaining = roundToCents(remaining - share);
    }
  }

  return results;
}

export function sum(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0);
}
