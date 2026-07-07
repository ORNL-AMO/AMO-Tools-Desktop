import { Injectable, signal, computed, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { AirLeakSurveyInput, AirLeakSurveyOutput, AirLeakSurveyData, AirLeakSurveyResult } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';
import { StandaloneService } from '../../standalone.service';
import { ConvertAirLeakService } from './convert-air-leak.service';
import { AirLeakSurveyFormService } from './air-leak-survey-form/air-leak-survey-form.service';
import { exampleLeakInputs, LeakMeasurementMethod } from '../compressed-air-constants';
import { copyObject } from '../../../shared/helperFunctions';

@Injectable()
export class AirLeakSurveyService {
  private readonly convertAirleakService = inject(ConvertAirLeakService);
  private readonly standaloneService = inject(StandaloneService);
  private readonly formService = inject(AirLeakSurveyFormService);

  settings: Settings;

  readonly airLeakInput = signal<AirLeakSurveyInput | undefined>(undefined);
  readonly currentLeakIndex = signal<number>(0);
  readonly currentField = signal<string>('default');
  private readonly resetEventsSubject = new Subject<void>();
  readonly resetEvents = this.resetEventsSubject.asObservable();

  readonly output = computed<AirLeakSurveyOutput>(() => {
    const input = this.airLeakInput();
    if (!input) return this.emptyOutput();
    if (!this.settings) return this.emptyOutput();
    if (!this.isValidInput(input)) return this.emptyOutput();
    return this.getResults(this.settings, input);
  });

  initDefaultEmptyInputs(settings: Settings): void {
    const emptyLeak = this.formService.getEmptyAirLeakData();
    this.airLeakInput.set({
      compressedAirLeakSurveyInputVec: [emptyLeak],
      facilityCompressorData: this.formService.getEmptyFacilityCompressorData(settings),
    });
  }

  generateExampleData(settings: Settings): void {
    const exampleLeaks: Array<AirLeakSurveyData> = copyObject(exampleLeakInputs);
    let example: AirLeakSurveyInput = {
      compressedAirLeakSurveyInputVec: exampleLeaks,
      facilityCompressorData: this.formService.getExampleFacilityCompressorData(),
    };
    if (settings.unitsOfMeasure !== 'Imperial') {
      example = this.convertAirleakService.convertExample(example);
    }
    this.currentLeakIndex.set(0);
    this.airLeakInput.set(example);
    this.resetEventsSubject.next();
  }

  resetToEmpty(settings: Settings): void {
    this.currentLeakIndex.set(0);
    this.initDefaultEmptyInputs(settings);
    this.resetEventsSubject.next();
  }

  deleteLeak(deleteIndex: number): void {
    const current = this.airLeakInput();
    if (!current) return;
    const leakInputs = current.compressedAirLeakSurveyInputVec;
    if (deleteIndex < 0 || deleteIndex >= leakInputs.length) return;

    if (leakInputs.length === 1 && deleteIndex === 0) {
      this.currentLeakIndex.set(0);
      if (this.settings) {
        this.initDefaultEmptyInputs(this.settings);
      } else {
        const emptyLeak = this.formService.getEmptyAirLeakData();
        this.airLeakInput.set({ ...current, compressedAirLeakSurveyInputVec: [emptyLeak] });
      }
      this.resetEventsSubject.next();
      return;
    }

    const updatedLeaks = leakInputs.filter((_, i) => i !== deleteIndex);
    const currentIndex = this.currentLeakIndex();
    const newIndex = currentIndex >= deleteIndex && currentIndex > 0 ? currentIndex - 1 : currentIndex;

    this.airLeakInput.set({ ...current, compressedAirLeakSurveyInputVec: updatedLeaks });
    if (newIndex !== currentIndex) {
      this.currentLeakIndex.set(newIndex);
    } else {
      this.resetEventsSubject.next();
    }
  }

  copyLeak(index: number): void {
    const current = this.airLeakInput();
    if (!current) return;
    const leakInputs = current.compressedAirLeakSurveyInputVec;
    if (index < 0 || index >= leakInputs.length) return;

    const copy: AirLeakSurveyData = { ...leakInputs[index], name: 'Copy of ' + leakInputs[index].name };
    this.airLeakInput.set({ ...current, compressedAirLeakSurveyInputVec: [...leakInputs, copy] });
  }

  setLeakForModification(index: number, selected: boolean): void {
    const current = this.airLeakInput();
    if (!current) return;
    const leakInputs = current.compressedAirLeakSurveyInputVec;
    if (index < 0 || index >= leakInputs.length) return;

    const updatedLeaks = leakInputs.map((leak, i) => i === index ? { ...leak, selected } : leak);
    this.airLeakInput.set({ ...current, compressedAirLeakSurveyInputVec: updatedLeaks });
  }

  setLeakForModificationSelectAll(selectAll: boolean): void {
    const current = this.airLeakInput();
    if (!current) return;
    const updatedLeaks = current.compressedAirLeakSurveyInputVec.map(leak => ({ ...leak, selected: selectAll }));
    this.airLeakInput.set({ ...current, compressedAirLeakSurveyInputVec: updatedLeaks });
  }

  getResults(settings: Settings, surveyInput: AirLeakSurveyInput): AirLeakSurveyOutput {
    const inputCopy: AirLeakSurveyInput = copyObject(surveyInput);

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
        surveyInput.facilityCompressorData?.compressorElectricityData?.compressorControlAdjustment ?? 1;
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

  private isValidInput(input: AirLeakSurveyInput): boolean {
    if (!input?.facilityCompressorData || !Array.isArray(input.compressedAirLeakSurveyInputVec)) return false;
    if (!this.formService.buildFacilityCompressorForm(input.facilityCompressorData).valid) return false;
    return true;
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
