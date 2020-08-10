import { Injectable } from '@angular/core';
import { AirLeakSurveyInput, AirLeakSurveyOutput, AirLeakSurveyData, AirLeakSurveyResult, BagMethodData, CompressorElectricityData, DecibelsMethodData, OrificeMethodData, EstimateMethodData, FacilityCompressorData } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';
import { StandaloneService } from '../../standalone.service';
import { ConvertAirLeakService } from './convert-air-leak.service';
import { BehaviorSubject } from 'rxjs';
import { AirLeakFormService } from './air-leak-form/air-leak-form.service';
import { exampleLeakInputs } from '../compressed-air-constants';



@Injectable()
export class AirLeakService {
  airLeakInput: BehaviorSubject<AirLeakSurveyInput>;
  airLeakOutput: BehaviorSubject<AirLeakSurveyOutput>;
  currentField: BehaviorSubject<string>;
  currentLeakIndex: BehaviorSubject<number>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;

  constructor(private convertAirleakService: ConvertAirLeakService,
    private airLeakFormService: AirLeakFormService,
    private standaloneService: StandaloneService) {
    this.currentField = new BehaviorSubject<string>('default');
    this.currentLeakIndex = new BehaviorSubject<number>(0);
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.airLeakInput = new BehaviorSubject<AirLeakSurveyInput>(undefined);
    this.airLeakOutput = new BehaviorSubject<AirLeakSurveyOutput>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  initDefaultEmptyInputs(settings: Settings) {
    let emptyLeak = this.airLeakFormService.getEmptyAirLeakData();
    let emptyAirLeakInput: AirLeakSurveyInput = {
      compressedAirLeakSurveyInputVec: [emptyLeak],
      facilityCompressorData: this.airLeakFormService.getEmptyFacilityCompressorData(settings)
    };
    this.airLeakInput.next(emptyAirLeakInput);
  }

  initDefaultEmptyOutputs(): AirLeakSurveyOutput {
    let emptyAirLeakSurveyOutput: AirLeakSurveyOutput = {
      leakResults: [
      ],
      baselineData: {
        totalFlowRate: 0,
        annualTotalElectricity: 0,
        annualTotalFlowRate: 0,
        annualTotalElectricityCost: 0,
      },
      modificationData: {
        totalFlowRate: 0,
        annualTotalElectricity: 0,
        annualTotalFlowRate: 0,
        annualTotalElectricityCost: 0,
      },
      savingsData: {
        totalFlowRate: 0,
        annualTotalElectricity: 0,
        annualTotalFlowRate: 0,
        annualTotalElectricityCost: 0,
      },
    };
    this.airLeakOutput.next(emptyAirLeakSurveyOutput);
    return emptyAirLeakSurveyOutput;
  }

  generateExampleData(settings: Settings) {
    let exampleLeaks: Array<AirLeakSurveyData> = JSON.parse(JSON.stringify(exampleLeakInputs));
    let airLeakInputExample: AirLeakSurveyInput = {
      compressedAirLeakSurveyInputVec: exampleLeaks,
      facilityCompressorData: this.airLeakFormService.getExampleFacilityCompressorData()
    }
    //convert example
    if (settings.unitsOfMeasure != 'Imperial') {
      airLeakInputExample = this.convertAirleakService.convertExample(airLeakInputExample);
    }
    this.airLeakInput.next(airLeakInputExample);
    this.generateExample.next(true);
    this.generateExample.next(false);
  }

  deleteLeak(index: number) {
    this.airLeakInput.value.compressedAirLeakSurveyInputVec.splice(index, 1);
    this.airLeakOutput.value.leakResults.splice(index, 1);
  }

  copyLeak(index: number) {
    let leakCopy = JSON.parse(JSON.stringify(this.airLeakInput.value.compressedAirLeakSurveyInputVec[index]));
    leakCopy.name = 'Copy of ' + leakCopy.name;
    this.airLeakInput.value.compressedAirLeakSurveyInputVec.push(leakCopy);
    this.airLeakInput.next(this.airLeakInput.value)
  }

  setLeakForModification(index: number, selected: boolean) {
    this.airLeakInput.value.compressedAirLeakSurveyInputVec[index].selected = selected;
    this.airLeakInput.next(this.airLeakInput.value);
  }

  calculate(settings: Settings): AirLeakSurveyOutput {
    let airLeakSurveyInput = this.airLeakInput.value;
    if (airLeakSurveyInput != undefined) {
      let outputs = this.getResults(settings, airLeakSurveyInput);
      this.airLeakOutput.next(outputs);
      return outputs;
    } else {
      return this.initDefaultEmptyOutputs();
    }
  }

  getResults(settings: Settings, airLeakSurveyInput: AirLeakSurveyInput): AirLeakSurveyOutput {
    let inputCopy: AirLeakSurveyInput = JSON.parse(JSON.stringify(airLeakSurveyInput));
    let validInput: boolean = this.airLeakFormService.checkValidInput(inputCopy);

    if (!validInput) {
      this.initDefaultEmptyOutputs();
    }
    // Attach facility compressor data to leaks before conversion
    inputCopy.compressedAirLeakSurveyInputVec.forEach(leak => {
      leak.hoursPerYear = inputCopy.facilityCompressorData.hoursPerYear;
      leak.utilityCost = inputCopy.facilityCompressorData.utilityCost;
      leak.utilityType = inputCopy.facilityCompressorData.utilityType;
      leak.compressorElectricityData = inputCopy.facilityCompressorData.compressorElectricityData;
    })
    let inputArray: Array<AirLeakSurveyData> = this.convertAirleakService.convertInputs(inputCopy.compressedAirLeakSurveyInputVec, settings);
    let baselineLeaks: AirLeakSurveyInput = { compressedAirLeakSurveyInputVec: inputArray };
    let modificationLeaks: AirLeakSurveyInput = { compressedAirLeakSurveyInputVec: Array<AirLeakSurveyData>() };
    //  Build baseline / modification leak results
    let leakResults = Array<AirLeakSurveyResult>();
    baselineLeaks.compressedAirLeakSurveyInputVec.forEach(leak => {
      if (!leak.selected) {
        modificationLeaks.compressedAirLeakSurveyInputVec.push(leak);
      }
      let leakResult: AirLeakSurveyResult = this.standaloneService.airLeakSurvey({ compressedAirLeakSurveyInputVec: [leak] });
      leakResult.name = leak.name;
      leakResult.leakDescription = leak.leakDescription;
      leakResult.selected = leak.selected;
      let converted = this.convertAirleakService.convertResult(leakResult, settings);
      leakResults.push(converted)
    });

    // Get cumulative leak results
    let baselineResults: AirLeakSurveyResult = this.standaloneService.airLeakSurvey(baselineLeaks);
    let modificationResults: AirLeakSurveyResult = this.standaloneService.airLeakSurvey(modificationLeaks);
    baselineResults = this.convertAirleakService.convertResult(baselineResults, settings);
    modificationResults = this.convertAirleakService.convertResult(modificationResults, settings);

    let savings: AirLeakSurveyResult = {
      totalFlowRate: baselineResults.totalFlowRate - modificationResults.totalFlowRate,
      annualTotalElectricity: baselineResults.annualTotalElectricity - modificationResults.annualTotalElectricity,
      annualTotalElectricityCost: baselineResults.annualTotalElectricityCost - modificationResults.annualTotalElectricityCost,
      annualTotalFlowRate: baselineResults.annualTotalFlowRate - modificationResults.annualTotalFlowRate,
    }
    let outputs: AirLeakSurveyOutput = {
      leakResults: leakResults,
      baselineData: baselineResults,
      modificationData: modificationResults,
      savingsData: savings,
      facilityCompressorData: inputCopy.facilityCompressorData,
    }
    return outputs;
  }

}
