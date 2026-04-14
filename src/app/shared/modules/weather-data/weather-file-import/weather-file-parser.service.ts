import { Injectable } from '@angular/core';
import * as Papa from 'papaparse/papaparse.js';
import * as XLSX from 'xlsx';
import { WeatherDataPoint } from '../../../weather-api.service';


@Injectable()
export class WeatherFileParserService {

  readonly columnSchemas: ColumnSchema[] = COLUMN_SCHEMAS;
  readonly timeColumnFormats: TimeColumnFormatOption[] = TIME_COLUMN_FORMAT_OPTIONS;

  async parseFile(file: File): Promise<WeatherFileParseResult> {
    const ext = file.name.split('.').pop()?.toLowerCase();
    let rows: Record<string, unknown>[];

    if (ext === 'csv') {
      const text = await file.text();
      rows = this.parseCsv(text);
    } else if (ext === 'xlsx') {
      const buffer = await file.arrayBuffer();
      rows = this.parseXlsx(buffer);
    } else {
      return {
        dataPoints: [], errors: ['Unsupported file type. Please upload a .csv or .xlsx file.'],
        rowCount: 0, detectedColumns: [], timeLabel: null, previewRawRows: [],
      };
    }

    const detectedColumns: string[] = rows.length > 0 ? Object.keys(rows[0]) : [];
    const errors: string[] = [];

    const timeSource: TimeSourceDetection = this.detectTimeHeaders(detectedColumns);
    if (!timeSource) {
      errors.push(TIME_COLUMN_HELP);
    }

    const schema: ColumnSchema = this.detectColumnSchema(detectedColumns);
    if (!schema) {
      errors.push(NO_SCHEMA_HELP);
    }

    if (errors.length > 0) {
      return { dataPoints: [], errors, rowCount: rows.length, detectedColumns, timeLabel: null, previewRawRows: [] };
    }

    if (rows.length !== 8760 && ENFORCE_8760_ROW_CONSTRAINT) {
      errors.push(`File must contain exactly 8760 hourly rows. Found: ${rows.length}.`);
    }

    const dataPoints: WeatherDataPoint[] = [];
    const timestamps = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      const timeValue: string = this.getTimeString(row, timeSource, schema);
      if (!this.isValidDatetime(timeValue)) {
        errors.push(`Row ${rowNum}: time value '${timeValue}' is not a valid date. Expected format: YYYY-MM-DDTHH:mm`);
      } else if (timestamps.has(timeValue) && ENFORCE_DUPLICATE_TIMESTAMP_CONSTRAINT) {
        errors.push(`Duplicate timestamp found: ${timeValue}.`);
      } else {
        timestamps.add(timeValue);
      }

      for (const header of Object.keys(schema.columnMappings)) {
        const val = row[header];
        if (val === '' || val === null || val === undefined) {
          continue;
        }

        if (isNaN(Number(val))) {
          errors.push(`Row ${rowNum}: '${header}' value '${val}' is not a number.`);
        }
      }

      dataPoints.push(this.mapRowToDataPoint(row, timeValue, schema));
    }

    return {
      dataPoints,
      errors,
      rowCount: rows.length,
      detectedColumns,
      timeLabel: this.buildTimeLabel(timeSource),
      previewRawRows: rows.slice(0, 5),
    };
  }

  // todo this needs revised instruction on what we'll accept
  /**
   * Determines which column(s) should be used as the time source.
   *
   * Priority:
   *  Case C (split) — a pure-date column AND a pure-time/hour column exist as SEPARATE headers.
   *  Case A/B (single) — any column whose name contains 'time', 'date', or 'hour'.
   *
   * "Pure date"      = matches /date/i  but NOT /time|hour/i  (e.g. "Date (MM/DD/YYYY)", "datestamp")
   * "Pure time/hour" = matches /time|hour/i but NOT /date/i   (e.g. "Time (HH:MM)", "Hour", "time")
   * A header matching BOTH patterns (e.g. "date_time") is treated as a single combined column (Case B).
   */
  detectTimeHeaders(columns: string[]): TimeSourceDetection | null {
    const pureDateCols = columns.filter(c => /date/i.test(c) && !/time|hour/i.test(c));
    const pureTimeCols = columns.filter(c => /time|hour/i.test(c) && !/date/i.test(c));

    if (pureDateCols.length > 0 && pureTimeCols.length > 0) {
      return { type: 'split', dateHeader: pureDateCols[0], timeHeader: pureTimeCols[0] };
    }

    const singleHeader = columns.find(c => /time|date|hour/i.test(c));
    if (singleHeader) {
      return { type: 'single', singleHeader: singleHeader };
    }

    return null;
  }

  detectColumnSchema(columns: string[]): ColumnSchema | null {
    return COLUMN_SCHEMAS.find(schema => schema.requiredHeaders.every(header => columns.includes(header))) ?? null;
  }


  private getTimeString(
    row: Record<string, unknown>,
    timeSource: TimeSourceDetection,
    schema: ColumnSchema,
  ): string {
    let raw: string;
    if (timeSource.type === 'split') {
      raw = `${row[timeSource.dateHeader] ?? ''} ${row[timeSource.timeHeader] ?? ''}`.trim();
    } else {
      raw = String(row[timeSource.singleHeader] ?? '');
    }

    if (schema.dateFormat === 'mm/dd/yyyy') {
      return this.normalizeMdyDatetime(raw);
    }
    return raw;
  }

  /** Converts "MM/DD/YYYY HH:MM" → "YYYY-MM-DDTHH:mm". Returns the original string if it does not match. */
  private normalizeMdyDatetime(value: string): string {
    const match = value.match(
      /^(?<month>\d{1,2})\/(?<day>\d{1,2})\/(?<year>\d{4})\s+(?<time>\d{1,2}:\d{2})/
    );
    if (!match) {
      return value;
    }

    const { month, day, year, time } = match.groups;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time}`;
  }

  private buildTimeLabel(timeSource: TimeSourceDetection): string {
    return timeSource.type === 'split'
      ? `'${timeSource.dateHeader}' + '${timeSource.timeHeader}'`
      : `'${timeSource.singleHeader}'`;
  }

  private parseCsv(text: string): Record<string, unknown>[] {
    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
    return result.data as Record<string, unknown>[];
  }

  private parseXlsx(buffer: ArrayBuffer): Record<string, unknown>[] {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  }

  private mapRowToDataPoint(
    row: Record<string, unknown>,
    time: string,
    schema: ColumnSchema,
  ): WeatherDataPoint {
    const point: WeatherDataPoint = { time };
    for (const [header, field] of Object.entries(schema.columnMappings)) {
      const val = row[header];
      if (val !== '' && val !== null && val !== undefined) {
        (point as any)[field] = Number(val);
      }
    }
    return point;
  }

  private isValidDatetime(value: string): boolean {
    // Format check: ensures the string matches YYYY-MM-DD[T ]HH:mm — only validates digit
    // counts, not whether the values are calendar-valid (e.g. month 13 passes here).
    if (!/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(value)) {
      return false;
    }
    // Semantic check: passes the normalized value through the JS Date constructor to catch
    // calendar impossibilities the regex cannot — e.g. month 13, day 32, hour 25.
    // Space-separated variants are normalized to T before parsing.
    if (ENFORCE_DATETIME_SEMANTIC_VALIDATION) {
      const normalized = value.replace(' ', 'T');
      const d = new Date(normalized);
      return !isNaN(d.getTime());
    }
    return true;
  }
}

export interface WeatherFileParseResult {
  dataPoints: WeatherDataPoint[];
  errors: string[];
  rowCount: number;
  detectedColumns: string[];
  // * column name that was used for time value
  timeLabel: string | null;
  // * first 5 raw rows from the file, keyed by original header name — used for the preview table
  previewRawRows: Record<string, unknown>[];
}

/** 'single': one column holds the full datetime; 'split': date and time come from separate columns. */
interface TimeSourceDetection {
  type: 'single' | 'split';
  singleHeader?: string;
  dateHeader?: string;
  timeHeader?: string;
}

/**
 * Describes a recognized column set.
 * `requiredHeaders`: column names that must all be present for this schema to match.
 * `columnMappings`: maps file header → WeatherDataPoint field for every column we care about.
 * `dateFormat`: how to interpret the raw date string extracted via the time-source detection.
 * `dateFormatNote`: optional display note shown in the UI (e.g. a required date format).
 */
export interface ColumnSchema {
  name: string;
  requiredHeaders: string[];
  columnMappings: Record<string, keyof WeatherDataPoint>;
  dateFormat: 'iso' | 'mm/dd/yyyy';
  dateFormatNote?: string;
}


export interface TimeColumnFormatOption {
  label: string;
  description: string;
// * Header name examples, rendered as <code> in the UI and joined as plain text in error messages.
  examples?: string[];
}

export const TIME_COLUMN_FORMAT_OPTIONS: TimeColumnFormatOption[] = [
  {
    label: 'A',
    description: `an explicit 'time' header representing a full timestamp with date and time components (e.g. '2024-01-01T00:00')`,
  },
  {
    label: 'B',
    description: `a single header whose name contains 'time', 'date', or 'hour' representing a full timestamp with date and time components`,
    examples: ['datestamp', 'date_time', 'Hour'],
  },
  {
    label: 'C',
    description: `two separate headers where one contains 'date' and the other contains 'time' or 'hour' — their values will be joined to form the timestamp`,
  },
];

const ORNL_LCD_SCHEMA: ColumnSchema = {
  name: 'ORNL/LCD',
  requiredHeaders: ['dry_bulb_temp', 'wet_bulb_temp'],
  columnMappings: {
    'dry_bulb_temp': 'dry_bulb_temp',
    'wet_bulb_temp': 'wet_bulb_temp',
  },
  dateFormat: 'iso',
};


const WEATHER_STATION_EXPORT_SCHEMA: ColumnSchema = {
  name: 'Weather Station Export',
  requiredHeaders: ['Dry-bulb Temperature (F)', 'Wet Bulb Temperature (F)'],
  columnMappings: {
    'Dry-bulb Temperature (F)': 'dry_bulb_temp',
    'Wet Bulb Temperature (F)': 'wet_bulb_temp',
  },
  dateFormat: 'mm/dd/yyyy',
  dateFormatNote: 'Dates must be in MM/DD/YYYY format.',
};

const COLUMN_SCHEMAS: ColumnSchema[] = [ORNL_LCD_SCHEMA, WEATHER_STATION_EXPORT_SCHEMA];

const TIME_COLUMN_HELP = [
  'No time column detected.',
  'Accepted time column formats:',
  ...TIME_COLUMN_FORMAT_OPTIONS.map(o => {
    const ex = o.examples?.length ? ` (e.g. ${o.examples.join(', ')})` : '';
    return `(${o.label}) ${o.description}${ex};`;
  }),
].join(' ');

const NO_SCHEMA_HELP = [
  'No recognized column set detected.',
  'Supported column sets —',
  ...COLUMN_SCHEMAS.map((s, i) => `(${i + 1}) ${s.name}: requires ${s.requiredHeaders.join(', ')};`),
  'Additional columns will be ignored.',
].join(' ');

// TODO: re-enable once testing with variable-length files is complete
const ENFORCE_8760_ROW_CONSTRAINT = true;
// TODO: re-enable once timestamp normalization is verified across all import formats
const ENFORCE_DUPLICATE_TIMESTAMP_CONSTRAINT = false;
const ENFORCE_DATETIME_SEMANTIC_VALIDATION = true;
