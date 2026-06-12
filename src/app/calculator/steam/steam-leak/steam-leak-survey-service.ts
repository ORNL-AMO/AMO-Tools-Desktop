import { Injectable, computed, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { FacilitySteamLeakData, SteamLeakSurveyData, SteamLeakSurveyInput, SteamLeakSurveyOutput, SteamLeakSurveyResult } from '../../../shared/models/standalone';
import { copyObject } from '../../../shared/helperFunctions';
import { StandaloneService } from '../../standalone.service';
import { ConvertSteamLeakService } from './convert-steam-leak.service';
import { SteamLeakSurveyFormService } from './steam-leak-survey-form/steam-leak-survey-form.service';
@Injectable()
export class SteamLeakSurveyService {

    private readonly standaloneService = inject(StandaloneService);
    private readonly convertSteamLeakService = inject(ConvertSteamLeakService);
    private readonly formService = inject(SteamLeakSurveyFormService);
    settings: Settings;
    
    readonly steamLeakInput = signal<SteamLeakSurveyInput | undefined>(undefined);
    readonly currentLeakIndex = signal<number>(0);
    readonly currentField = signal<string>('default');
    private readonly resetEventsSubject = new Subject<void>();
    readonly resetEvents = this.resetEventsSubject.asObservable();


    readonly output = computed<SteamLeakSurveyOutput>(() => {
        const input = this.steamLeakInput();
        if (!input) return this.emptyOutput();
        if (!this.settings) return this.emptyOutput();
        if (!this.isValidInput(input)) return this.emptyOutput();
        return this.getResults(this.settings, input);
    });

  initDefaultEmptyInputs(settings: Settings): void {
    this.steamLeakInput.set({
      steamLeakSurveyInputVec: [this.formService.getEmptySteamLeakData()],
      facilitySteamLeakData: this.getDefaultFacilityData(settings),
    });
  }

  generateExampleData(settings: Settings): void {
    let example: SteamLeakSurveyInput = {
      steamLeakSurveyInputVec: [this.getExampleLeakData()],
      facilitySteamLeakData: this.getDefaultFacilityData(settings),
    };
    if (settings.unitsOfMeasure !== 'Imperial') {
      example = this.convertSteamLeakService.convertExample(example);
    }
    this.currentLeakIndex.set(0);
    this.steamLeakInput.set(example);
    this.resetEventsSubject.next();
  }

  resetToEmpty(settings: Settings): void {
    this.currentLeakIndex.set(0);
    this.initDefaultEmptyInputs(settings);
    this.resetEventsSubject.next();
  }

    deleteLeak(deleteIndex: number): void {
      const current = this.steamLeakInput();
      if (!current) return;
      const leakInputs = current.steamLeakSurveyInputVec;
      if (deleteIndex < 0 || deleteIndex >= leakInputs.length) return;
  
      if (leakInputs.length === 1 && deleteIndex === 0) {
        this.currentLeakIndex.set(0);
        if (this.settings) {
          this.initDefaultEmptyInputs(this.settings);
        } else {
          const emptyLeak = this.formService.getEmptySteamLeakData();
          this.steamLeakInput.set({ ...current, steamLeakSurveyInputVec: [emptyLeak] });
        }
        this.resetEventsSubject.next();
        return;
      }
  
      const updatedLeaks = leakInputs.filter((_, i) => i !== deleteIndex);
      const currentIndex = this.currentLeakIndex();
      const newIndex = currentIndex >= deleteIndex && currentIndex > 0 ? currentIndex - 1 : currentIndex;
  
      this.steamLeakInput.set({ ...current, steamLeakSurveyInputVec: updatedLeaks });
      if (newIndex !== currentIndex) {
        this.currentLeakIndex.set(newIndex);
      } else {
        this.resetEventsSubject.next();
      }
    }
  
    copyLeak(index: number): void {
      const current = this.steamLeakInput();
      if (!current) return;
      const leakInputs = current.steamLeakSurveyInputVec;
      if (index < 0 || index >= leakInputs.length) return;
  
      const copy: SteamLeakSurveyData = { ...leakInputs[index], name: 'Copy of ' + leakInputs[index].name };
      this.steamLeakInput.set({ ...current, steamLeakSurveyInputVec: [...leakInputs, copy] });
    }
  
    setLeakForModification(index: number, selected: boolean): void {
      const current = this.steamLeakInput();
      if (!current) return;
      const leakInputs = current.steamLeakSurveyInputVec;
      if (index < 0 || index >= leakInputs.length) return;
  
      const updatedLeaks = leakInputs.map((leak, i) => i === index ? { ...leak, selected } : leak);
      this.steamLeakInput.set({ ...current, steamLeakSurveyInputVec: updatedLeaks });
    }
  
    setLeakForModificationSelectAll(selectAll: boolean): void {
      const current = this.steamLeakInput();
      if (!current) return;
      const updatedLeaks = current.steamLeakSurveyInputVec.map(leak => ({ ...leak, selected: selectAll }));
      this.steamLeakInput.set({ ...current, steamLeakSurveyInputVec: updatedLeaks });
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

  private getDefaultFacilityData(settings: Settings): FacilitySteamLeakData {
    let data: FacilitySteamLeakData = {
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
    if (settings?.unitsOfMeasure === 'Metric') {
      data = this.convertSteamLeakService.convertImperialFacilitySteamLeakData(data);
    }
    return data;
  }

    getResults(settings: Settings, input: SteamLeakSurveyInput): SteamLeakSurveyOutput {
        const inputCopy: SteamLeakSurveyInput = copyObject(input);

        this.convertSteamLeakService.convertInputs(inputCopy.steamLeakSurveyInputVec, settings);
        inputCopy.facilitySteamLeakData = this.convertSteamLeakService.convertFacilityInputs(inputCopy.facilitySteamLeakData, settings);

        const individualLeaks: Array<SteamLeakSurveyResult> = [];
        let cumulativeModifiactionResults: SteamLeakSurveyResult = emptyResult();

        const cumulativeBaselineResults = inputCopy.steamLeakSurveyInputVec.reduce(
        (cumulative: SteamLeakSurveyResult, leak: SteamLeakSurveyData) => {
            const leakResult: SteamLeakSurveyResult = this.standaloneService.steamLeakSurvey({
            steamLeakSurveyInputVec: [leak],
            facilitySteamLeakData: inputCopy.facilitySteamLeakData,
            });
            leakResult.name = leak.name;
            leakResult.leakDescription = leak.leakDescription;
            leakResult.selected = leak.selected;

            const convertedResult = this.convertSteamLeakService.convertResult(leakResult, settings);

            if (!leak?.selected) {
                cumulativeModifiactionResults.leakRate += convertedResult.leakRate;
                cumulativeModifiactionResults.steamLoss += convertedResult.steamLoss;
                cumulativeModifiactionResults.energyLoss += convertedResult.energyLoss;
                cumulativeModifiactionResults.leakCost += convertedResult.leakCost;
            }

            individualLeaks.push(convertedResult);
            return {
                leakRate: cumulative.leakRate + convertedResult.leakRate,
                steamLoss: cumulative.steamLoss + convertedResult.steamLoss,
                energyLoss: cumulative.energyLoss + convertedResult.energyLoss,
                leakCost: cumulative.leakCost + convertedResult.leakCost,
            };
        },
        emptyResult()
        );
        const savings: SteamLeakSurveyResult = {
            leakRate: cumulativeBaselineResults.leakRate - cumulativeModifiactionResults.leakRate,
            steamLoss: cumulativeBaselineResults.steamLoss - cumulativeModifiactionResults.steamLoss,
            energyLoss: cumulativeBaselineResults.energyLoss - cumulativeModifiactionResults.energyLoss,
            leakCost: cumulativeBaselineResults.leakCost - cumulativeModifiactionResults.leakCost,
        };

        cumulativeModifiactionResults.steamLoss = cumulativeBaselineResults.steamLoss - savings.steamLoss;
        cumulativeModifiactionResults.energyLoss = cumulativeBaselineResults.energyLoss - savings.energyLoss;
        cumulativeModifiactionResults.leakCost = cumulativeBaselineResults.leakCost - savings.leakCost;
        cumulativeModifiactionResults.leakRate = cumulativeBaselineResults.leakRate - savings.leakRate;

        return {
            individualLeaks,
            baselineTotal: cumulativeBaselineResults,
            modificationTotal: cumulativeModifiactionResults,
            savings,
            facilitySteamLeakData: inputCopy.facilitySteamLeakData,
        };
    };

    private isValidInput(input: SteamLeakSurveyInput): boolean {
        if (!input?.facilitySteamLeakData || !Array.isArray(input.steamLeakSurveyInputVec)) return false;
        if (!this.formService.buildFacilitySteamLeakForm(input.facilitySteamLeakData).valid) return false;
        return true;
    }

    private emptyOutput(): SteamLeakSurveyOutput {
        return {
        individualLeaks: [],
        baselineTotal: emptyResult(),
        modificationTotal: emptyResult(),
        savings: emptyResult(),
        };
    }

}


function emptyResult(): SteamLeakSurveyResult {
    return { leakRate: 0, steamLoss: 0, energyLoss: 0, leakCost: 0 };
}