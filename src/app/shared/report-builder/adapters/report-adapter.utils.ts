import { ReportColumnCell } from '../models/report-ui-models';
import { PairedKeyValueSection } from '../models/report-section.model';
import { FacilityInfo } from '../../models/settings';

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

/**
 * Builds the standard "Facility Info" paired-key-value sections (General/Location,
 * Facility Contact/Assessment Contact) shared across every module's report adapter.
 */
export function buildFacilityInfoSections(facilityInfo: FacilityInfo | undefined, groupKey: string): PairedKeyValueSection[] {
  if (!facilityInfo) return [];

  const generalAndLocation: PairedKeyValueSection = {
    type: 'paired-key-value',
    title: 'Facility Info',
    group: groupKey,
    left: {
      headerLabel: 'General',
      rows: [
        { label: 'Company Name', value: facilityInfo.companyName ?? '' },
        { label: 'Facility Name', value: facilityInfo.facilityName ?? '' },
        { label: 'Assessment Date', value: facilityInfo.date ?? '' },
      ],
    },
    right: {
      headerLabel: 'Location',
      rows: [
        { label: 'Street', value: facilityInfo.address?.street ?? '' },
        { label: 'City', value: facilityInfo.address?.city ?? '' },
        { label: 'State', value: facilityInfo.address?.state ?? '' },
        { label: 'Zip', value: facilityInfo.address?.zip ?? '' },
        { label: 'Country', value: facilityInfo.address?.country ?? '' },
      ],
    },
  };

  const contacts: PairedKeyValueSection = {
    type: 'paired-key-value',
    group: groupKey,
    left: {
      headerLabel: 'Facility Contact',
      rows: [
        { label: 'Name', value: facilityInfo.facilityContact?.contactName ?? '' },
        { label: 'Phone', value: String(facilityInfo.facilityContact?.phoneNumber ?? '') },
        { label: 'Email', value: facilityInfo.facilityContact?.email ?? '' },
      ],
    },
    right: {
      headerLabel: 'Assessment Contact',
      rows: [
        { label: 'Name', value: facilityInfo.assessmentContact?.contactName ?? '' },
        { label: 'Phone', value: String(facilityInfo.assessmentContact?.phoneNumber ?? '') },
        { label: 'Email', value: facilityInfo.assessmentContact?.email ?? '' },
      ],
    },
  };

  return [generalAndLocation, contacts];
}

/**
 * Creates a `row` builder for baseline-vs-modifications summary tables: given a label, baseline
 * value, and a per-modification accessor, produces a `[label, baseline, ...modifications]` row.
 * Values are stringified with `fmt` (default: `String(v)` or '—' when null/undefined).
 */
export function createSummaryRowBuilder<M>(mods: M[]) {
  return function row<T extends string | number | boolean | null | undefined>(
    label: string,
    baseVal: T,
    modFn: (mod: M) => T,
    fmt?: (v: T) => string
  ): string[] {
    const f = fmt ?? ((v: T) => v != null ? String(v) : '—');
    return [label, f(baseVal), ...mods.map(m => f(modFn(m)))];
  };
}

/**
 * Appends a labeled sub-group header row (spanning all columns) followed by its data rows,
 * and records the header's index in `subGroupHeaderIndices` for bold/accent rendering in the PDF.
 */
export function appendSubGroup(
  rows: string[][],
  subGroupHeaderIndices: number[],
  columnCount: number,
  label: string,
  groupRows: string[][]
): void {
  subGroupHeaderIndices.push(rows.length);
  rows.push([label, ...Array(columnCount - 1).fill('')]);
  rows.push(...groupRows);
}
