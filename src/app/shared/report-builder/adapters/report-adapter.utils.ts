import { ReportColumnCell } from '../models/report-ui-models';

/** Appends decoded units to the label when present. Both sides are decoded. */
export function labelWithUnits(label: string, units: string | undefined): string {
  const decoded = decodeHtmlEntities(label);
  if (!units) return decoded;
  return `${decoded} ${decodeHtmlEntities(units)}`;
}

/** Formats a number with configurable decimal places using the en-US locale. */
export function formatNumber(value: number, maxDec = 0, minDec = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: minDec,
    maximumFractionDigits: maxDec,
  }).format(value);
}

/** Parses an Angular DecimalPipe format string like '1.0-2' → [minDec, maxDec]. */
export function parseDigitsInfo(digitsInfo: string | undefined): [number, number] {
  if (!digitsInfo) return [0, 0];
  const match = digitsInfo.match(/\d+\.(\d+)-(\d+)/);
  if (!match) return [0, 0];
  return [parseInt(match[1], 10), parseInt(match[2], 10)];
}

/** Decodes numeric HTML entities (e.g. &#8457; → ℉) and strips HTML tags. */
export function decodeHtmlEntities(str: string): string {
  if (!str) return str;
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '');
}

/**
 * Formats a ReportColumnCell value to a display string.
 * Applies currency or decimal pipe formatting when present; falls back to locale number or '—'.
 */
export function formatCell(cell: ReportColumnCell): string {
  if (cell?.value == null) return '—';
  const num = Number(cell.value);
  if (isNaN(num)) return String(cell.value);

  if (cell.currencyPipe) {
    const [minDec, maxDec] = parseDigitsInfo(cell.currencyPipe.digitsInfo);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cell.currencyPipe.code,
      minimumFractionDigits: minDec,
      maximumFractionDigits: maxDec,
    }).format(num);
  }

  if (cell.decimalPipe) {
    const [minDec, maxDec] = parseDigitsInfo(cell.decimalPipe);
    return formatNumber(num, maxDec, minDec);
  }

  return num.toLocaleString('en-US');
}
