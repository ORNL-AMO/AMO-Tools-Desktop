import { Injectable } from '@angular/core';
import * as Papa from 'papaparse/papaparse.js';
import Fuse from 'fuse.js';

export type CagiRow = Record<string, string>;

export interface CompressorPlotPoint { capacity: number; power: number; }

export interface CompressorPlotData {
  label: string;
  /** VSD units plot their full ladder; fixed-speed units plot a two-point load/unload line. */
  isVsd: boolean;
  /** Sorted ascending by capacity */
  points: Array<CompressorPlotPoint>;
  maxCapacity: number;
  maxPower: number;
}

@Injectable()
export class CagiLookupService {

  fields: Array<string> = [];
  rows: Array<CagiRow> = [];
  modelNumberKey: string = 'Model Number';
  pressureKey: string = '';

  // Resolved plot-data column keys.
  private ratedCapacityKey: string = '';
  private fullLoadPowerKey: string = '';
  private zeroFlowPowerKey: string = '';
  private ladderKeys: Array<{ cap: string, pow: string }> = [];

  private fuse: Fuse<CagiRow>;
  private loaded: boolean = false;
  private readonly csvPath: string = 'assets/cagi_output.csv';
  private readonly preferredKey: string = 'Model Number';

  initCagiData(): Promise<boolean> {
    if (this.loaded) { return Promise.resolve(true); }
    return new Promise((resolve, reject) => {
      Papa.parse(this.csvPath, {
        header: true, download: true, skipEmptyLines: true,
        complete: (results: { data: Array<CagiRow>, meta: { fields?: Array<string> } }) => {
          this.fields = results.meta.fields ?? [];
          this.rows = (results.data ?? []).filter(row => this.rowHasValue(row));
          this.modelNumberKey = this.resolveModelNumberKey(this.fields);
          this.pressureKey = this.resolvePressureKey(this.fields);
          this.resolvePlotKeys(this.fields);
          this.buildIndex();
          this.loaded = true;
          resolve(true);
        },
        error: () => reject(false)
      });
    });
  }

  search(term: string, limit: number = 8): Array<CagiRow> {
    const trimmed: string = term.trim();
    if (!trimmed || !this.fuse) { return []; }
    return this.fuse.search(trimmed, { limit }).map(result => result.item);
  }

  /**
   * Plot points for one compressor: the VSD ladder when it has 2+ rungs, otherwise the zero-flow
   * and full-load points.
   */
  extractPoints(row: CagiRow, label: string): CompressorPlotData {
    const rated: number = this.num(row[this.ratedCapacityKey]);
    const fullLoad: number = this.num(row[this.fullLoadPowerKey]);
    const zeroFlow: number = this.num(row[this.zeroFlowPowerKey]);

    const ladder: Array<CompressorPlotPoint> = [];
    this.ladderKeys.forEach(key => {
      const cap: number = this.num(row[key.cap]);
      const pow: number = this.num(row[key.pow]);
      if (!isNaN(cap) && !isNaN(pow)) { ladder.push({ capacity: cap, power: pow }); }
    });
    ladder.sort((a, b) => a.capacity - b.capacity);

    let isVsd: boolean = false;
    let points: Array<CompressorPlotPoint> = [];
    if (ladder.length >= 2) {
      isVsd = true;
      points = ladder;
    } else {
      if (!isNaN(zeroFlow)) { points.push({ capacity: 0, power: zeroFlow }); }
      if (!isNaN(rated) && !isNaN(fullLoad)) { points.push({ capacity: rated, power: fullLoad }); }
      points.sort((a, b) => a.capacity - b.capacity);
    }

    const maxCapacity: number = points.length ? Math.max(...points.map(p => p.capacity)) : 0;
    const maxPower: number = points.length ? Math.max(...points.map(p => p.power)) : 0;
    return { label: label, isVsd: isVsd, points: points, maxCapacity: maxCapacity, maxPower: maxPower };
  }

  private resolvePlotKeys(fields: Array<string>): void {
    this.ratedCapacityKey = this.resolveKey(fields, /rated capacity.*\(acfm\)/i);
    this.fullLoadPowerKey = this.resolveKey(fields, /input power at rated capacity.*\(kw\)/i);
    this.zeroFlowPowerKey = this.resolveKey(fields, /input power at zero flow/i);
    const defs: Array<[RegExp, RegExp]> = [
      [/\bmax capacity\b.*\(acfm\)/i, /input power at max capacity/i],
      [/\bcapacity 4\b.*\(acfm\)/i, /input power at capacity 4/i],
      [/\bcapacity 3\b.*\(acfm\)/i, /input power at capacity 3/i],
      [/\bcapacity 2\b.*\(acfm\)/i, /input power at capacity 2/i],
      [/\bcapacity 1\b.*\(acfm\)/i, /input power at capacity 1/i],
      [/\bmin capacity\b.*\(acfm\)/i, /input power at min capacity/i]
    ];
    this.ladderKeys = defs.map(pair => ({ cap: this.resolveKey(fields, pair[0]), pow: this.resolveKey(fields, pair[1]) }));
  }

  private resolveKey(fields: Array<string>, pattern: RegExp): string {
    return fields.find(field => pattern.test(field)) ?? '';
  }

  private num(value: string): number {
    if (value === undefined || value === null || String(value).trim() === '') { return NaN; }
    return parseFloat(String(value).replace(/,/g, ''));
  }

  private buildIndex(): void {
    this.fuse = new Fuse(this.rows, { keys: [this.modelNumberKey], threshold: 0.4, ignoreLocation: true, minMatchCharLength: 1 });
  }

  private resolveModelNumberKey(fields: Array<string>): string {
    const exact: string | undefined = fields.find(field => field === this.preferredKey);
    if (exact) { return exact; }
    const fuzzy: string | undefined = fields.find(field => /model\s*(number|no\.?|#)?/i.test(field));
    if (fuzzy) { return fuzzy; }
    return fields[0] ?? this.preferredKey;
  }

  private resolvePressureKey(fields: Array<string>): string {
    return fields.find(field => /\(psig\)/i.test(field)) ?? '';
  }

  private rowHasValue(row: CagiRow): boolean {
    return Object.values(row).some(value => value !== null && value !== undefined && String(value).trim() !== '');
  }
}
