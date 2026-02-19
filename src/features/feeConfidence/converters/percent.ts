export function percentToDecimalString(input: string): string {
  const n = parseFloat(input);
  if (!Number.isFinite(n)) return "0";
  return (n / 100).toString();
}
