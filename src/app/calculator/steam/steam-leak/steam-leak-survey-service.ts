import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { FacilitySteamLeakData, SteamLeakSurveyData, SteamLeakSurveyInput } from '../../../shared/models/standalone';

@Injectable()
export class SteamLeakSurveyService {
  settings: Settings;
  readonly steamLeakInput = signal<SteamLeakSurveyInput | undefined>(undefined);
  readonly currentLeakIndex = signal<number>(0);
  readonly currentField = signal<string>('default');
  private readonly resetEventsSubject = new Subject<void>();
  readonly resetEvents = this.resetEventsSubject.asObservable();

  initDefaultEmptyInputs(settings: Settings): void {
    this.steamLeakInput.set({
      steamLeakSurveyInputVec: [this.getEmptyLeakData()],
      facilitySteamLeakData: this.getDefaultFacilityData(settings),
    });
  }

  generateExampleData(settings: Settings): void {
    this.currentLeakIndex.set(0);
    this.steamLeakInput.set({
      steamLeakSurveyInputVec: [this.getExampleLeakData()],
      facilitySteamLeakData: this.getDefaultFacilityData(settings),
    });
    this.resetEventsSubject.next();
  }

  resetToEmpty(settings: Settings): void {
    this.currentLeakIndex.set(0);
    this.initDefaultEmptyInputs(settings);
    this.resetEventsSubject.next();
  }

  private getEmptyLeakData(): SteamLeakSurveyData {
    return {
      selected: true,
      name: 'Leak 1',
      leakDescription: '',
      measurementMethod: 0,
      estimateMethodData: { leakRate: 0 },
      estimateTurbineMethodData: { turbineEfficiency: 0, leakRate: 0 },
      orificeMethodData: { turbineEfficiency: 0, holeSize: 0, dischargeCoefficient: 0.61, atmosphericPressure: 14.7 },
      plumeMethodData: { turbineEfficiency: 0, plumeLength: 0, ambientTemperature: 70 },
      units: 0,
    };
  }

  private getExampleLeakData(): SteamLeakSurveyData {
    return {
      selected: true,
      name: 'Example Leak',
      leakDescription: 'Example steam trap leak',
      measurementMethod: 0,
      estimateMethodData: { leakRate: 100 },
      estimateTurbineMethodData: { turbineEfficiency: 80, leakRate: 100 },
      orificeMethodData: { turbineEfficiency: 80, holeSize: 0.25, dischargeCoefficient: 0.61, atmosphericPressure: 14.7 },
      plumeMethodData: { turbineEfficiency: 80, plumeLength: 6, ambientTemperature: 70 },
      units: 0,
    };
  }

  private getDefaultFacilityData(_settings: Settings): FacilitySteamLeakData {
    return {
      annualOperatingHours: 8760,
      utilityType: 1,
      steamCost: 0,
      steamTemperature: 500,
      steamPressure: 300,
      feedwaterTemperature: 70,
      fuelCost: 15.5,
      fuelEnergyFactor: 1.038,
      electricityCost: 0.1,
      boilerEfficiency: 80,
      systemEfficiency: 75,
    };
  }
}