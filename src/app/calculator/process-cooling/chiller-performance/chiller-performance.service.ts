import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { ChillerPerformanceInput, ChillerPerformanceOutput } from '../../../shared/models/chillers';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { ChillersSuiteApiService } from '../../../tools-suite-api/chillers-suite-api.service';
import { ChillerPerformanceFormService } from './chiller-performance-form.service';

@Injectable()
export class ChillerPerformanceService {

  chillerPerformanceInput: BehaviorSubject<ChillerPerformanceInput>;
  chillerPerformanceOutput: BehaviorSubject<ChillerPerformanceOutput>;
  
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;
  hasWeatherBinsData: BehaviorSubject<boolean>;


  operatingHours: OperatingHours;

  constructor(private convertUnitsService: ConvertUnitsService, 
    private chillersSuiteApiService: ChillersSuiteApiService,
    private chillerPerformanceFormService: ChillerPerformanceFormService) { 
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.chillerPerformanceInput = new BehaviorSubject<ChillerPerformanceInput>(undefined);
    this.chillerPerformanceOutput = new BehaviorSubject<ChillerPerformanceOutput>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.currentField = new BehaviorSubject<string>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
  }

  initDefaultEmptyInputs(settings: Settings) {
    let emptyInput: ChillerPerformanceInput = {
      chillerType: 0,
      condenserCoolingType: 0,
      motorDriveType: 0,
      compressorConfigType: 0,
      ariCapacity: 0,
      ariEfficiency: 0,
      maxCapacityRatio: 0,
      waterDeltaT: 0,
      waterFlowRate: 0,
      operatingHours: 0,
      baselineWaterSupplyTemp: 0,
      baselineWaterEnteringTemp: 0,
      modWaterSupplyTemp: 0,
      modWaterEnteringTemp: 0,
      electricityCost: settings.electricityCost
    };
    this.chillerPerformanceInput.next(emptyInput);
  }

  initDefaultEmptyOutputs() {
    let emptyOutput: ChillerPerformanceOutput = {
      baselineActualEfficiency: 0,
      baselineActualCapacity: 0,
      baselinePower: 0,
      baselineEnergy: 0,
      modActualEfficiency: 0,
      modActualCapacity: 0,
      modPower: 0,
      modEnergy: 0,
      savingsEnergy: 0,
      baselineEnergyCost: 0,
      modEnergyCost: 0,
      annualCostSaving: 0,
    };
    this.chillerPerformanceOutput.next(emptyOutput);
  }

  calculate(settings: Settings, inputs?: ChillerPerformanceInput) {
    let chillerPerformanceInput: ChillerPerformanceInput;
    let inputCopy: ChillerPerformanceInput;
    if (!inputs){
      chillerPerformanceInput = this.chillerPerformanceInput.getValue();
      inputCopy = JSON.parse(JSON.stringify(chillerPerformanceInput));
    } else {
      inputCopy = JSON.parse(JSON.stringify(inputs));
    }
    let validInput: boolean;
    validInput = this.chillerPerformanceFormService.getChillerPerformanceForm(inputCopy).valid;
    
    if(!validInput) {
      this.initDefaultEmptyOutputs();
    } else {
      inputCopy = this.convertInputUnits(inputCopy, settings);
      let chillerPerformanceOutput: ChillerPerformanceOutput = this.chillersSuiteApiService.chillerCapacityEfficiency(inputCopy);
      chillerPerformanceOutput = this.convertResultUnits(chillerPerformanceOutput, settings);
      chillerPerformanceOutput.baselineEnergyCost = chillerPerformanceOutput.baselineEnergy * inputCopy.electricityCost;
      chillerPerformanceOutput.modEnergyCost = chillerPerformanceOutput.modEnergy * inputCopy.electricityCost;
      chillerPerformanceOutput.annualCostSaving = chillerPerformanceOutput.baselineEnergyCost - chillerPerformanceOutput.modEnergyCost;
      this.chillerPerformanceOutput.next(chillerPerformanceOutput);
      return chillerPerformanceOutput;
    }
  }

  generateExampleData(settings: Settings) {
    let exampleInput: ChillerPerformanceInput = {
      chillerType: 0,
      condenserCoolingType: 0,
      motorDriveType: 0,
      compressorConfigType: 1,
      ariCapacity: 1000,
      ariEfficiency: .676,
      maxCapacityRatio: 1,
      waterDeltaT: 16.54,
      waterFlowRate: 924.90,
      operatingHours: 7000,
      baselineWaterSupplyTemp: 42,
      baselineWaterEnteringTemp: 82.12,
      modWaterSupplyTemp: 43,
      modWaterEnteringTemp: 81.12,
      electricityCost: settings.electricityCost
    };

    if (settings.unitsOfMeasure == 'Metric') {
      exampleInput = this.convertExampleUnits(exampleInput);
    }
    this.chillerPerformanceInput.next(exampleInput);
  }
  
  convertExampleUnits(input: ChillerPerformanceInput): ChillerPerformanceInput {
    input.baselineWaterSupplyTemp = this.convertUnitsService.value(input.baselineWaterSupplyTemp).from('F').to('C');
    input.baselineWaterSupplyTemp = this.roundVal(input.baselineWaterSupplyTemp, 2);

    input.baselineWaterEnteringTemp = this.convertUnitsService.value(input.baselineWaterEnteringTemp).from('F').to('C');
    input.baselineWaterEnteringTemp = this.roundVal(input.baselineWaterEnteringTemp, 2);

    input.modWaterSupplyTemp = this.convertUnitsService.value(input.modWaterSupplyTemp).from('F').to('C');
    input.modWaterSupplyTemp = this.roundVal(input.modWaterSupplyTemp, 2);

    input.modWaterEnteringTemp = this.convertUnitsService.value(input.modWaterEnteringTemp).from('F').to('C');
    input.modWaterEnteringTemp = this.roundVal(input.modWaterEnteringTemp, 2);

    
    input.waterDeltaT = this.convertUnitsService.value(input.waterDeltaT).from('R').to('K');
    input.waterDeltaT = this.roundVal(input.waterDeltaT, 2);

    input.waterFlowRate = this.convertUnitsService.value(input.waterFlowRate).from('gpm').to('m3/s');
    input.waterFlowRate = this.roundVal(input.waterFlowRate, 2);

    input.ariCapacity = this.convertUnitsService.value(input.ariCapacity).from('kW').to('hp');
    input.ariCapacity = this.roundVal(input.ariCapacity, 2);


    return input;
  }

  convertInputUnits(input: ChillerPerformanceInput, settings: Settings): ChillerPerformanceInput {
    if (settings.unitsOfMeasure == "Metric") {
      input.baselineWaterSupplyTemp = this.convertUnitsService.value(input.baselineWaterSupplyTemp).from('C').to('F');
      input.baselineWaterEnteringTemp = this.convertUnitsService.value(input.baselineWaterEnteringTemp).from('C').to('F');
      input.modWaterSupplyTemp = this.convertUnitsService.value(input.modWaterSupplyTemp).from('C').to('F');
      input.modWaterEnteringTemp = this.convertUnitsService.value(input.modWaterEnteringTemp).from('C').to('F');
      
      input.waterDeltaT = this.convertUnitsService.value(input.waterDeltaT).from('K').to('R');
      input.waterDeltaT = this.roundVal(input.waterDeltaT, 2);
      input.waterFlowRate = this.convertUnitsService.value(input.waterFlowRate).from('m3/s').to('gpm');
      input.ariCapacity = this.convertUnitsService.value(input.ariCapacity).from('kW').to('hp');
    }
    return input;
  }

  convertResultUnits(output: ChillerPerformanceOutput, settings: Settings): ChillerPerformanceOutput {
    if (settings.unitsOfMeasure == "Imperial") {
      output.baselinePower = this.convertUnitsService.value(output.baselinePower).from('kW').to('hp');
      output.baselinePower = this.roundVal(output.baselinePower, 2);
      
      output.modPower = this.convertUnitsService.value(output.modPower).from('kW').to('hp');
      output.modPower = this.roundVal(output.modPower, 2);
    }
    if (settings.unitsOfMeasure == "Metric") {
      output.baselineActualCapacity = this.convertUnitsService.value(output.baselineActualCapacity).from('tons').to('kW');
      output.baselineActualCapacity = this.roundVal(output.baselineActualCapacity, 2);

      output.modActualCapacity = this.convertUnitsService.value(output.modActualCapacity).from('tons').to('kW');
      output.modActualCapacity = this.roundVal(output.modActualCapacity, 2);
    }
    return output;
  }

  roundVal(val: number, digits: number): number {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

}
