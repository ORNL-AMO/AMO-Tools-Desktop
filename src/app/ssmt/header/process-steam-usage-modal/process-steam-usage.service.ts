import { Injectable } from '@angular/core';
import { ConvertValue } from '../../../shared/convert-units/ConvertValue';
import { roundVal } from '../../../shared/helperFunctions';
import { ProcessSteamUsageData, ProcessSteamUsageRow } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';

export type SteamHeaderPressureLevel = 'highPressure' | 'mediumPressure' | 'lowPressure';

export interface ProcessSteamUsageTotals {
  processSteamUsage: number;
  recoveredCondensate: number;
  condensateRecoveryRate: number;
}

@Injectable()
export class ProcessSteamUsageService {
  // Issue #3019 rates are mass flow per leak or failed trap in klb/hr.
  private readonly lossRates = {
    'steam-leaks': {
      lowPressure: 0.001,
      mediumPressure: 0.012,
      highPressure: 0.031
    },
    'steam-trap-leaks': {
      lowPressure: 0.004,
      mediumPressure: 0.048,
      highPressure: 0.125
    }
  } as const;

  getDefaultData(processSteamUsage: number, condensateRecoveryRate: number): ProcessSteamUsageData {
    return {
      rows: [
        this.getLossRow('Steam Leaks', 'steam-leaks'),
        this.getLossRow('Steam Trap Leaks', 'steam-trap-leaks'),
        {
          name: 'Process 1',
          type: 'process',
          steamUsage: processSteamUsage ?? 0,
          condensateRecoverable: true,
          condensateRecoveryRate: condensateRecoveryRate ?? 0
        }
      ]
    };
  }

  updateCalculatedLosses(data: ProcessSteamUsageData, pressureLevel: SteamHeaderPressureLevel, settings: Settings): ProcessSteamUsageData {
    const rows = data.rows.map(row => {
      if (row.type === 'process') {
        return { ...row };
      }

      const lossRate = this.lossRates[row.type][pressureLevel];
      const steamUsageKlbPerHour = (row.quantity ?? 0) * lossRate;
      const steamUsage = settings.steamMassFlowMeasurement === 'klb'
        ? steamUsageKlbPerHour
        : new ConvertValue(steamUsageKlbPerHour, 'klb', settings.steamMassFlowMeasurement).convertedValue;
      return { ...row, steamUsage };
    });

    return { rows };
  }

  calculateTotals(data: ProcessSteamUsageData): ProcessSteamUsageTotals {
    const processSteamUsage = data.rows.reduce((total, row) => total + this.getNonNegativeValue(row.steamUsage), 0);
    const recoveredCondensate = data.rows.reduce((total, row) => {
      if (!row.condensateRecoverable) {
        return total;
      }
      const steamUsage = this.getNonNegativeValue(row.steamUsage);
      const recoveryRate = Math.min(this.getNonNegativeValue(row.condensateRecoveryRate), 100);
      return total + steamUsage * (recoveryRate / 100);
    }, 0);
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

  private getLossRow(name: string, type: 'steam-leaks' | 'steam-trap-leaks'): ProcessSteamUsageRow {
    return {
      name,
      type,
      quantity: 0,
      steamUsage: 0,
      condensateRecoverable: false,
      condensateRecoveryRate: 0
    };
  }

  private getNonNegativeValue(value: number): number {
    return Number.isFinite(value) ? Math.max(value, 0) : 0;
  }
}
