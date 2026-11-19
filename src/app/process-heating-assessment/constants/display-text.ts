// The only module source file allowed to hold non-ASCII characters (enforced by
// scripts/check-process-heating-ascii.js). Templates use HTML entities instead; these are for
// plain-text strings that Angular interpolates or the report adapter sends to the PDF.

export const EM_DASH = '—';

export const UNIT_SYMBOL = {
  fahrenheit: '℉',
  celsius: '℃',
  squareFeet: 'ft²',
  squareMeters: 'm²',
  cubicFeet: 'ft³',
  cubicMeters: 'm³',
  normalCubicMeters: 'Nm³',
} as const;

export const CHEMICAL_FORMULA = {
  O2: 'O₂',
  H2: 'H₂',
  H2O: 'H₂O',
  CH4: 'CH₄',
} as const;

/**
 * Characters the PDF's built-in Helvetica font can't draw, each paired with a look-alike it can.
 * A subscript digit also switches jsPDF to a two-byte encoding that garbles the whole string.
 */
export const PDF_TEXT_REPLACEMENTS: ReadonlyArray<readonly [string, string]> = [
  ['℉', '°F'],
  ['℃', '°C'],
  ['₂', '2'],
  ['₄', '4'],
];
