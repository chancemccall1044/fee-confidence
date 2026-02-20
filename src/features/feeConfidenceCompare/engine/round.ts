export const roundMoney2 = (n: number) =>
  Math.round((n + Number.EPSILON) * 100) / 100;
