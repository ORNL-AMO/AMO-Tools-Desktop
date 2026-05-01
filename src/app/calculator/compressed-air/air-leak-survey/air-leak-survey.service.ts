import { Injectable, signal, computed, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { AirLeakSurveyInput, AirLeakSurveyOutput, AirLeakSurveyData, AirLeakSurveyResult } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';
import { StandaloneService } from '../../standalone.service';
import { ConvertAirLeakService } from '../air-leak/convert-air-leak.service';
import { AirLeakSurveyFormService } from './air-leak-survey-form/air-leak-survey-form.service';
import { exampleLeakInputs, LeakMeasurementMethod } from '../compressed-air-constants';

@Injectable()
export class AirLeakSurveyService {
  private readonly convertAirleakService = inject(ConvertAirLeakService);
  private readonly standaloneService = inject(StandaloneService);
  private readonly formService = inject(AirLeakSurveyFormService);

  settings: Settings;

  readonly input = signal<AirLeakSurveyInput | undefined>(undefined);
  readonly currentLeakIndex = signal<number>(0);
  readonly currentField = signal<string>('default');
  readonly resetEvents$ = new Subject<void>();

  readonly output = computed<AirLeakSurveyOutput>(() => {
    const input = this.input();
    if (!input) return this.emptyOutput();
    if (!isValidAirLeakInput(input)) return this.emptyOutput();
    return this.getResults(this.settings, input);
  });

  initDefaultEmptyInputs(settings: Settings): void {
    const emptyLeak = this.formService.getEmptyAirLeakData();
    this.input.set({
      compressedAirLeakSurveyInputVec: [emptyLeak],
      facilityCompressorData: this.formService.getEmptyFacilityCompressorData(settings),
    });
  }

  generateExampleData(settings: Settings): void {
    const exampleLeaks: Array<AirLeakSurveyData> = JSON.parse(JSON.stringify(exampleLeakInputs));
    let example: AirLeakSurveyInput = {
      compressedAirLeakSurveyInputVec: exampleLeaks,
      facilityCompressorData: this.formService.getExampleFacilityCompressorData(),
    };
    if (settings.unitsOfMeasure !== 'Imperial') {
      example = this.convertAirleakService.convertExample(example);
    }
    this.currentLeakIndex.set(0);
    this.input.set(example);
    this.resetEvents$.next();
  }

  resetToEmpty(settings: Settings): void {
    this.currentLeakIndex.set(0);
    this.initDefaultEmptyInputs(settings);
    this.resetEvents$.next();
  }

  deleteLeak(deleteIndex: number): void {
    const current = this.input();
    if (!current) return;
    const vec = current.compressedAirLeakSurveyInputVec;
    if (deleteIndex < 0 || deleteIndex >= vec.length) return;

    if (vec.length === 1 && deleteIndex === 0) {
      this.currentLeakIndex.set(0);
      this.initDefaultEmptyInputs(this.settings);
      this.resetEvents$.next();
      return;
    }

    const newVec = vec.filter((_, i) => i !== deleteIndex);
    const currentIndex = this.currentLeakIndex();
    const newIndex = currentIndex >= deleteIndex && currentIndex > 0 ? currentIndex - 1 : currentIndex;

    this.input.set({ ...current, compressedAirLeakSurveyInputVec: newVec });
    if (newIndex !== currentIndex) {
      this.currentLeakIndex.set(newIndex);
    } else {
      this.resetEvents$.next();
    }
  }

  copyLeak(index: number): void {
    const current = this.input();
    if (!current) return;
    const vec = current.compressedAirLeakSurveyInputVec;
    if (index < 0 || index >= vec.length) return;

    const copy: AirLeakSurveyData = JSON.parse(JSON.stringify(vec[index]));
    copy.name = 'Copy of ' + copy.name;
    this.input.set({ ...current, compressedAirLeakSurveyInputVec: [...vec, copy] });
  }

  setLeakForModification(index: number, selected: boolean): void {
    const current = this.input();
    if (!current) return;
    const vec = current.compressedAirLeakSurveyInputVec;
    if (index < 0 || index >= vec.length) return;

    const newVec = vec.map((leak, i) => i === index ? { ...leak, selected } : leak);
    this.input.set({ ...current, compressedAirLeakSurveyInputVec: newVec });
  }

  setLeakForModificationSelectAll(selectAll: boolean): void {
    const current = this.input();
    if (!current) return;
    const newVec = current.compressedAirLeakSurveyInputVec.map(leak => ({ ...leak, selected: selectAll }));
    this.input.set({ ...current, compressedAirLeakSurveyInputVec: newVec });
  }

  getResults(settings: Settings, surveyInput: AirLeakSurveyInput): AirLeakSurveyOutput {
    const inputCopy: AirLeakSurveyInput = JSON.parse(JSON.stringify(surveyInput));

    this.convertAirleakService.convertInputs(inputCopy.compressedAirLeakSurveyInputVec, settings);
    inputCopy.facilityCompressorData.compressorElectricityData.compressorSpecificPower =
      this.convertAirleakService.convertCompressorSpecificPower(
        inputCopy.facilityCompressorData.compressorElectricityData.compressorSpecificPower,
        settings
      );

    const individualLeaks: Array<AirLeakSurveyResult> = [];
    let cumulativeModificationResults: AirLeakSurveyResult = emptyResult();

    const cumulativeBaselineResults = inputCopy.compressedAirLeakSurveyInputVec.reduce(
      (cumulative: AirLeakSurveyResult, leak: AirLeakSurveyData) => {
        const leakResult: AirLeakSurveyResult = this.standaloneService.airLeakSurvey({
          compressedAirLeakSurveyInputVec: [leak],
          facilityCompressorData: inputCopy.facilityCompressorData,
        });
        leakResult.name = leak.name;
        leakResult.leakDescription = leak.leakDescription;
        leakResult.selected = leak.selected;

        const convertedResult =
          leak.measurementMethod === LeakMeasurementMethod.Bag
            ? this.convertAirleakService.convertBagMethodResult(leakResult, settings)
            : this.convertAirleakService.convertResult(leakResult, settings);

        if (!leak?.selected) {
          cumulativeModificationResults.annualTotalElectricity += convertedResult.annualTotalElectricity;
          cumulativeModificationResults.annualTotalElectricityCost += convertedResult.annualTotalElectricityCost;
          cumulativeModificationResults.annualTotalFlowRate += convertedResult.annualTotalFlowRate;
          cumulativeModificationResults.totalFlowRate += convertedResult.totalFlowRate;
        }

        individualLeaks.push(convertedResult);
        return {
          totalFlowRate: cumulative.totalFlowRate + convertedResult.totalFlowRate,
          annualTotalElectricity: cumulative.annualTotalElectricity + convertedResult.annualTotalElectricity,
          annualTotalElectricityCost: cumulative.annualTotalElectricityCost + convertedResult.annualTotalElectricityCost,
          annualTotalFlowRate: cumulative.annualTotalFlowRate + convertedResult.annualTotalFlowRate,
        };
      },
      emptyResult()
    );

    let savings: AirLeakSurveyResult = {
      totalFlowRate: cumulativeBaselineResults.totalFlowRate - cumulativeModificationResults.totalFlowRate,
      annualTotalElectricity: cumulativeBaselineResults.annualTotalElectricity - cumulativeModificationResults.annualTotalElectricity,
      annualTotalElectricityCost: cumulativeBaselineResults.annualTotalElectricityCost - cumulativeModificationResults.annualTotalElectricityCost,
      annualTotalFlowRate: cumulativeBaselineResults.annualTotalFlowRate - cumulativeModificationResults.annualTotalFlowRate,
    };

    if (inputCopy.facilityCompressorData.utilityType === 1) {
      const compressorControlAdjustment =
        surveyInput.facilityCompressorData?.compressorElectricityData?.compressorControlAdjustment || 1;
        savings.annualTotalElectricity = savings.annualTotalElectricity * (compressorControlAdjustment / 100);
        savings.annualTotalElectricityCost = savings.annualTotalElectricityCost * (compressorControlAdjustment / 100);
    }

    cumulativeModificationResults.annualTotalElectricity = cumulativeBaselineResults.annualTotalElectricity - savings.annualTotalElectricity;
    cumulativeModificationResults.annualTotalElectricityCost = cumulativeBaselineResults.annualTotalElectricityCost - savings.annualTotalElectricityCost;

    return {
      individualLeaks,
      baselineTotal: cumulativeBaselineResults,
      modificationTotal: cumulativeModificationResults,
      savings,
      facilityCompressorData: inputCopy.facilityCompressorData,
    };
  }

  private emptyOutput(): AirLeakSurveyOutput {
    return {
      individualLeaks: [],
      baselineTotal: emptyResult(),
      modificationTotal: emptyResult(),
      savings: emptyResult(),
    };
  }
}

function emptyResult(): AirLeakSurveyResult {
  return { totalFlowRate: 0, annualTotalElectricity: 0, annualTotalFlowRate: 0, annualTotalElectricityCost: 0 };
}

export function isValidAirLeakInput(input: AirLeakSurveyInput): boolean {
  if (!input?.facilityCompressorData || !Array.isArray(input.compressedAirLeakSurveyInputVec)) return false;

  const { hoursPerYear, utilityCost } = input.facilityCompressorData;
  if (hoursPerYear == null || hoursPerYear < 0 || hoursPerYear > 8760) return false;
  if (utilityCost == null || utilityCost < 0) return false;

  return input.compressedAirLeakSurveyInputVec.every(isValidLeak);
}

function isValidLeak(leak: AirLeakSurveyData): boolean {
  if (!leak.name?.trim() || !leak.leakDescription?.trim()) return false;

  switch (leak.measurementMethod) {
    case LeakMeasurementMethod.Estimate:
      return leak.estimateMethodData.leakRateEstimate > 0;
    case LeakMeasurementMethod.Bag:
      return leak.bagMethodData.bagVolume >= 0 && leak.bagMethodData.bagFillTime >= 0;
    case LeakMeasurementMethod.Orifice:
      return (
        leak.orificeMethodData.compressorAirTemp >= 0 &&
        leak.orificeMethodData.atmosphericPressure >= 0 &&
        leak.orificeMethodData.dischargeCoefficient >= 0 &&
        leak.orificeMethodData.orificeDiameter >= 0 &&
        leak.orificeMethodData.supplyPressure >= 0 &&
        leak.orificeMethodData.numberOfOrifices >= 1
      );
    case LeakMeasurementMethod.Decibel:
      return (
        leak.decibelsMethodData.linePressure >= 0 &&
        leak.decibelsMethodData.decibels >= 0 &&
        leak.decibelsMethodData.decibelRatingA >= 0 &&
        leak.decibelsMethodData.pressureA >= 0 &&
        leak.decibelsMethodData.firstFlowA >= 0 &&
        leak.decibelsMethodData.secondFlowA >= 0 &&
        leak.decibelsMethodData.decibelRatingB >= 0 &&
        leak.decibelsMethodData.pressureB >= 0 &&
        leak.decibelsMethodData.firstFlowB >= 0 &&
        leak.decibelsMethodData.secondFlowB >= 0
      );
    default:
      return false;
  }
}
