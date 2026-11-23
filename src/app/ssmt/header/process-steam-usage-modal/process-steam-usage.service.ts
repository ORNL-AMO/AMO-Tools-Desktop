import { Injectable } from '@angular/core';
import { roundVal } from '../../../shared/helperFunctions';
import { ProcessSteamUsageData, ProcessSteamUsageRow } from '../../../shared/models/steam/ssmt';

export type SteamHeaderPressureLevel = 'highPressure' | 'mediumPressure' | 'lowPressure';
export type SteamHeaderKey = 'highPressureHeader' | 'mediumPressureHeader' | 'lowPressureHeader';

export interface ProcessSteamUsageTotals {
  processSteamUsage: number;
  recoveredCondensate: number;
  condensateRecoveryRate: number;
}

export const OTHER_STEAM_USE_NAME = 'Other (Miscellaneous)';

@Injectable()
export class ProcessSteamUsageService {

  getDefaultData(processSteamUsage: number, condensateRecoveryRate: number): ProcessSteamUsageData {
    return {
      rows: [
        {
          name: 'Process 1',
          type: 'process',
          steamUsage: processSteamUsage ?? 0,
          condensateRecoverable: true,
          condensateRecoveryRate: condensateRecoveryRate ?? 0
        },
        this.getOtherRow()
      ]
    };
  }

  /**
   * Returns a copy with process rows first and the fixed Other (Miscellaneous) row last.
   * Rows from earlier test builds (steam leaks and steam trap leaks) are combined into the Other row,
   * keeping their usage and recovered condensate so the header totals they were applied with don't change.
   */
  getCalculatorData(data: ProcessSteamUsageData): ProcessSteamUsageData {
    const rows: ProcessSteamUsageRow[] = this.copyData(data)?.rows ?? [];
    const processRows = rows.filter(row => row.type === 'process');
    const otherRows = rows.filter(row => row.type !== 'process');
    if (otherRows.length === 1 && otherRows[0].type === 'other') {
      return { rows: [...processRows, otherRows[0]] };
    }

    const otherRow = this.getOtherRow();
    if (otherRows.length > 0) {
      // Sums aren't rounded first, so a small recovered flow (e.g. 0.001 klb/hr at 4%) still marks Other as recoverable.
      const steamUsage = otherRows.reduce((total, row) => total + this.getNonNegativeValue(row.steamUsage), 0);
      const recoveredCondensate = otherRows.reduce((total, row) => total + this.getRecoveredCondensate(row), 0);
      otherRow.steamUsage = roundVal(steamUsage, 4);
      otherRow.condensateRecoverable = recoveredCondensate > 0;
      otherRow.condensateRecoveryRate = recoveredCondensate > 0 ? roundVal(recoveredCondensate / steamUsage * 100, 4) : 0;
    }
    return { rows: [...processRows, otherRow] };
  }

  calculateTotals(data: ProcessSteamUsageData): ProcessSteamUsageTotals {
    const processSteamUsage = data.rows.reduce((total, row) => total + this.getNonNegativeValue(row.steamUsage), 0);
    const recoveredCondensate = data.rows.reduce((total, row) => total + this.getRecoveredCondensate(row), 0);
    const condensateRecoveryRate = processSteamUsage === 0
      ? 0
      : Math.min(100, recoveredCondensate / processSteamUsage * 100);

    // Match the 4 decimal places the Steam module uses for stored flows, and drop floating-point noise
    // (e.g. 0.002 + 0.012 + 60 + 40 = 100.01400000000001) before totals are written to the header fields.
    return {
      processSteamUsage: roundVal(processSteamUsage, 4),
      recoveredCondensate: roundVal(recoveredCondensate, 4),
      condensateRecoveryRate: roundVal(condensateRecoveryRate, 4)
    };
  }

  getPressureLevel(header: SteamHeaderKey): SteamHeaderPressureLevel {
    const pressureLevels: Record<SteamHeaderKey, SteamHeaderPressureLevel> = {
      highPressureHeader: 'highPressure',
      mediumPressureHeader: 'mediumPressure',
      lowPressureHeader: 'lowPressure'
    };
    return pressureLevels[header];
  }

  copyData(data: ProcessSteamUsageData): ProcessSteamUsageData {
    return data ? JSON.parse(JSON.stringify(data)) : undefined;
  }

  isDataModified(baselineData: ProcessSteamUsageData, modificationData: ProcessSteamUsageData): boolean {
    if (!modificationData) {
      return false;
    }
    return JSON.stringify(baselineData ?? null) !== JSON.stringify(modificationData);
  }

  private getOtherRow(): ProcessSteamUsageRow {
    return {
      name: OTHER_STEAM_USE_NAME,
      type: 'other',
      steamUsage: 0,
      condensateRecoverable: false,
      condensateRecoveryRate: 0
    };
  }

  private getRecoveredCondensate(row: ProcessSteamUsageRow): number {
    if (!row.condensateRecoverable) {
      return 0;
    }
    const recoveryRate = Math.min(this.getNonNegativeValue(row.condensateRecoveryRate), 100);
    return this.getNonNegativeValue(row.steamUsage) * (recoveryRate / 100);
  }

  private getNonNegativeValue(value: number): number {
    return Number.isFinite(value) ? Math.max(value, 0) : 0;
  }
}
