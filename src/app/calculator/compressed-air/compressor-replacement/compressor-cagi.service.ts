import { Injectable } from '@angular/core';
import * as Papa from 'papaparse/papaparse.js';
import Fuse from 'fuse.js';

export type CagiRow = Record<string, string>;

export interface CagiRequirementCriteria {
  capacity: number; capacityRange: number; pressure: number; pressureRange: number;
  vsdOnly: boolean; includeWaterCooled: boolean; oilFree: boolean; brand: string;
}

export interface CagiExtractedData {
  manufacturer: string;
  modelNumber: string;
  ratedCapacity: number;
  fullLoadPower: number;
  zeroFlowPower: number;
  fullLoadPressure: number;
  maxFullFlowPressure: number;
  cagiType: string;
  numberOfStages: number;
  compressorOilFree: boolean;
  // VSD capacity/power ladder; undefined where the sheet leaves a rung blank
  maxCapacity: number;
  capacity4: number;
  capacity3: number;
  capacity2: number;
  capacity1: number;
  minCapacity: number;
  powerAtMaxCapacity: number;
  powerAtCapacity4: number;
  powerAtCapacity3: number;
  powerAtCapacity2: number;
  powerAtCapacity1: number;
  powerAtMinCapacity: number;
}

@Injectable()
export class CompressorCagiService {

  static readonly COL = {
    manufacturer: 'Manufacturer',
    modelNumber: 'Model Number',
    control: 'Control',
    waterCooled: 'Water-cooled',
    oilFree: 'Oil-free',
    ratedCapacity: 'Rated Capacity at Full Load Operating Pressure (acfm)',
    fullLoadPressure: 'Full Load Operating Pressure (psig)',
    maxFullFlowPressure: 'Maximum Full Flow Operating Pressure (psig)',
    type: 'Type',
    stages: '# of Stages',
    zeroFlowPower: 'Total Package Input Power at Zero Flow (kW)',
    fullLoadPower: 'Total Package Input Power at Rated Capacity and Full Load Operating Pressure (kW)',
    maxCapacity: 'Max Capacity (acfm)',
    capacity4: 'Capacity 4 (acfm)',
    capacity3: 'Capacity 3 (acfm)',
    capacity2: 'Capacity 2 (acfm)',
    capacity1: 'Capacity 1 (acfm)',
    minCapacity: 'Min Capacity (acfm)',
    powerAtMaxCapacity: 'Total Package Input Power at Max Capacity (kW)',
    powerAtCapacity4: 'Total Package Input Power at Capacity 4 (kW)',
    powerAtCapacity3: 'Total Package Input Power at Capacity 3 (kW)',
    powerAtCapacity2: 'Total Package Input Power at Capacity 2 (kW)',
    powerAtCapacity1: 'Total Package Input Power at Capacity 1 (kW)',
    powerAtMinCapacity: 'Total Package Input Power at Min Capacity (kW)'
  };

  fields: Array<string> = [];
  rows: Array<CagiRow> = [];
  manufacturers: Array<string> = [];
  private fuse: Fuse<CagiRow>;
  private loaded: boolean = false;
  private readonly csvPath: string = 'assets/cagi_output.csv';

  initCagiData(): Promise<boolean> {
    if (this.loaded) { return Promise.resolve(true); }
    return new Promise((resolve, reject) => {
      Papa.parse(this.csvPath, {
        header: true, download: true, skipEmptyLines: true,
        complete: (results: { data: Array<CagiRow>, meta: { fields?: Array<string> } }) => {
          this.fields = results.meta.fields ?? [];
          this.rows = (results.data ?? []).filter(row => (row[CompressorCagiService.COL.modelNumber] || '').trim() !== '');
          this.manufacturers = this.getDistinctManufacturers(this.rows);
          this.fuse = new Fuse(this.rows, { keys: [CompressorCagiService.COL.modelNumber], threshold: 0.4, ignoreLocation: true, minMatchCharLength: 1 });
          this.loaded = true;
          resolve(true);
        },
        error: () => reject(false)
      });
    });
  }

  searchByModel(term: string, limit: number = 8): Array<CagiRow> {
    const trimmed: string = (term || '').trim();
    if (!trimmed || !this.fuse) { return []; }
    return this.fuse.search(trimmed, { limit }).map(result => result.item);
  }

  searchByRequirements(criteria: CagiRequirementCriteria, limit: number = 8): Array<CagiRow> {
    if (criteria.capacity === undefined || criteria.capacity === null || isNaN(criteria.capacity)) { return []; }
    const capRange: number = criteria.capacityRange || 0;
    const pressRange: number = criteria.pressureRange || 0;
    const matches: Array<CagiRow> = (this.rows || []).filter(row => {
      const capacity: number = this.num(row[CompressorCagiService.COL.ratedCapacity]);
      const pressure: number = this.num(row[CompressorCagiService.COL.fullLoadPressure]);
      if (isNaN(capacity) || Math.abs(capacity - criteria.capacity) > capRange) { return false; }
      if (!isNaN(pressure) && Math.abs(pressure - criteria.pressure) > pressRange) { return false; }
      if (criteria.vsdOnly && !this.isVsd(row)) { return false; }
      if (!criteria.includeWaterCooled && this.isYes(row[CompressorCagiService.COL.waterCooled])) { return false; }
      if (criteria.oilFree && !this.isYes(row[CompressorCagiService.COL.oilFree])) { return false; }
      if (criteria.brand && row[CompressorCagiService.COL.manufacturer] !== criteria.brand) { return false; }
      return true;
    });
    matches.sort((a, b) => {
      const da: number = Math.abs(this.num(a[CompressorCagiService.COL.ratedCapacity]) - criteria.capacity);
      const db: number = Math.abs(this.num(b[CompressorCagiService.COL.ratedCapacity]) - criteria.capacity);
      if (da !== db) { return da - db; }
      return Math.abs(this.num(a[CompressorCagiService.COL.fullLoadPressure]) - criteria.pressure) - Math.abs(this.num(b[CompressorCagiService.COL.fullLoadPressure]) - criteria.pressure);
    });
    return matches.slice(0, limit);
  }

  /** VSD data sheets publish zero power at zero flow. */
  isVsd(row: CagiRow): boolean {
    return this.num(row[CompressorCagiService.COL.zeroFlowPower]) === 0;
  }

  extractData(row: CagiRow): CagiExtractedData {
    const C = CompressorCagiService.COL;
    return {
      manufacturer: row[C.manufacturer] || '',
      modelNumber: row[C.modelNumber] || '',
      ratedCapacity: this.num(row[C.ratedCapacity]),
      fullLoadPower: this.num(row[C.fullLoadPower]),
      zeroFlowPower: this.num(row[C.zeroFlowPower]),
      fullLoadPressure: this.numOrUndef(row[C.fullLoadPressure]),
      maxFullFlowPressure: this.numOrUndef(row[C.maxFullFlowPressure]),
      cagiType: row[C.type] || '',
      numberOfStages: this.numOrUndef(row[C.stages]),
      compressorOilFree: this.isYes(row[C.oilFree]),
      maxCapacity: this.numOrUndef(row[C.maxCapacity]),
      capacity4: this.numOrUndef(row[C.capacity4]),
      capacity3: this.numOrUndef(row[C.capacity3]),
      capacity2: this.numOrUndef(row[C.capacity2]),
      capacity1: this.numOrUndef(row[C.capacity1]),
      minCapacity: this.numOrUndef(row[C.minCapacity]),
      powerAtMaxCapacity: this.numOrUndef(row[C.powerAtMaxCapacity]),
      powerAtCapacity4: this.numOrUndef(row[C.powerAtCapacity4]),
      powerAtCapacity3: this.numOrUndef(row[C.powerAtCapacity3]),
      powerAtCapacity2: this.numOrUndef(row[C.powerAtCapacity2]),
      powerAtCapacity1: this.numOrUndef(row[C.powerAtCapacity1]),
      powerAtMinCapacity: this.numOrUndef(row[C.powerAtMinCapacity])
    };
  }

  suggestionLabel(row: CagiRow): string {
    const C = CompressorCagiService.COL;
    const mfr: string = row[C.manufacturer] || '';
    const model: string = row[C.modelNumber] || '';
    const psig: string = (row[C.fullLoadPressure] || '').trim();
    const acfm: string = (row[C.ratedCapacity] || '').trim();
    const detail: string = [psig ? psig + ' psig' : '', acfm ? acfm + ' acfm' : ''].filter(part => part).join(', ');
    return (mfr ? mfr + ' ' : '') + model + (detail ? ' (' + detail + ')' : '');
  }

  private getDistinctManufacturers(rows: Array<CagiRow>): Array<string> {
    const set: Set<string> = new Set<string>();
    rows.forEach(row => {
      const mfr: string = (row[CompressorCagiService.COL.manufacturer] || '').trim();
      if (mfr) { set.add(mfr); }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  private num(value: string): number {
    if (value === undefined || value === null || String(value).trim() === '') { return NaN; }
    return parseFloat(String(value).replace(/,/g, ''));
  }

  private numOrUndef(value: string): number {
    const n: number = this.num(value);
    return isNaN(n) ? undefined : n;
  }

  private isYes(value: string): boolean {
    return (value || '').trim().toLowerCase() === 'yes';
  }
}
