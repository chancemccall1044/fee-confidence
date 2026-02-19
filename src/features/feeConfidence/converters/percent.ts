/* ---------- Percent Converter ----------
   Converts a UI percent string (e.g., "28.50") into a decimal string (e.g., "0.285") for canonical CDIO inputs.
*/
/**
 * percentToDecimalString
 *
 * Purpose:
 * - UI inputs are percent-form strings (human-friendly).
 * - Canonical CDIO expects decimal-form rates (machine-friendly).
 *
 * Behavior:
 * - Uses parseFloat to accept values like "28.50", " 28.50 ", and "28.5".
 * - If input is not finite, returns "0" to avoid NaN propagation into Truth Engine.
 *
 * NOTE (DO NOT BREAK):
 * - This returns a STRING (not a number) to preserve canonical transport format and avoid float drift.
 * - This does not clamp ranges (e.g., negative or >100%). Validation/clamping is a separate concern.
 */
export function percentToDecimalString(input: string): string {
  const n = parseFloat(input);
  if (!Number.isFinite(n)) return "0";
  return (n / 100).toString();
}
