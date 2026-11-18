import { PDF_TEXT_REPLACEMENTS } from '../constants/display-text';

/**
 * Swaps characters the PDF font can't draw for look-alikes it can. Expects already-decoded text.
 * Temporary until the shared report builder handles this for every module (#9114).
 * @param text decoded plain text bound for the PDF
 * @returns text the PDF's built-in font can render
 */
export function toPdfText(text: string): string {
  return PDF_TEXT_REPLACEMENTS.reduce((result, [symbol, replacement]) => result.replaceAll(symbol, replacement), text);
}
