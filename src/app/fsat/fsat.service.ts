import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Fan203Inputs, BaseGasDensity, PlaneData, Plane, Modification, FSAT, FsatInput, FsatOutput, PlaneResults, Fan203Results, CompressibilityFactor } from '../shared/models/fans';
import { FanFieldDataService } from './fan-field-data/fan-field-data.service';
import { FanSetupService } from './fan-setup/fan-setup.service';
import { FanMotorService } from './fan-motor/fan-motor.service';
import { FormGroup } from '@angular/forms';
import { FsatFluidService } from './fsat-fluid/fsat-fluid.service';
import { Settings } from '../shared/models/settings';
import { ConvertFsatService } from './convert-fsat.service';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { FanEfficiencyInputs } from '../calculator/fans/fan-efficiency/fan-efficiency.service';


declare var fanAddon: any;

@Injectable()
export class FsatService {


  mainTab: BehaviorSubject<string>;
  stepTab: BehaviorSubject<string>;
  assessmentTab: BehaviorSubject<string>;
  openNewModal: BehaviorSubject<boolean>;
  openModificationModal: BehaviorSubject<boolean>;
  modalOpen: BehaviorSubject<boolean>;
  updateData: BehaviorSubject<boolean>;
  calculatorTab: BehaviorSubject<string>;
  constructor(private convertFsatService: ConvertFsatService, private convertUnitsService: ConvertUnitsService, private fanFieldDataService: FanFieldDataService, private fsatFluidService: FsatFluidService, private fanSetupService: FanSetupService, private fanMotorService: FanMotorService) {
    this.initData();
  }


  initData() {
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.stepTab = new BehaviorSubject<string>('system-basics');
    this.assessmentTab = new BehaviorSubject<string>('explore-opportunities');
    this.calculatorTab = new BehaviorSubject<string>('system-curve');
    this.openNewModal = new BehaviorSubject<boolean>(false);
    this.openModificationModal = new BehaviorSubject<boolean>(false);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.updateData = new BehaviorSubject<boolean>(false)
  }

  test() {
    console.log(fanAddon);
  }

  fan203(input: Fan203Inputs, settings: Settings): Fan203Results {

    input.BaseGasDensity = this.convertFsatService.convertGasDensityForCalculations(input.BaseGasDensity, settings);
    input.FanRatedInfo = this.convertFsatService.convertFanRatedInfoForCalculations(input.FanRatedInfo, settings);
    if (input.PlaneData) {
      input.PlaneData = this.convertFsatService.convertPlaneDataForCalculations(input.PlaneData, settings);
    }
    input.FanShaftPower.sumSEF = input.PlaneData.inletSEF + input.PlaneData.outletSEF;
    let results: Fan203Results = fanAddon.fan203(input);
    results = this.convertFsatService.convertFan203Results(results, settings);
    return results;
  }

  getBaseGasDensityDewPoint(inputs: BaseGasDensity, settings: Settings): number {
    inputs = this.convertFsatService.convertGasDensityForCalculations(inputs, settings);
    let result: number = fanAddon.getBaseGasDensityDewPoint(inputs);
    if (settings.densityMeasurement != 'lbscf') {
      result = this.convertUnitsService.value(result).from('lbscf').to(settings.densityMeasurement);
    }
    return result;
  }

  getBaseGasDensityRelativeHumidity(inputs: BaseGasDensity, settings: Settings): number {
    inputs = this.convertFsatService.convertGasDensityForCalculations(inputs, settings);
    let result: number = fanAddon.getBaseGasDensityRelativeHumidity(inputs);
    if (settings.densityMeasurement != 'lbscf') {
      result = this.convertUnitsService.value(result).from('lbscf').to(settings.densityMeasurement);
    }
    return result;
  }

  getBaseGasDensityWetBulb(inputs: BaseGasDensity, settings: Settings): number {
    inputs = this.convertFsatService.convertGasDensityForCalculations(inputs, settings);
    let result: number = fanAddon.getBaseGasDensityWetBulb(inputs);
    if (settings.densityMeasurement != 'lbscf') {
      result = this.convertUnitsService.value(result).from('lbscf').to(settings.densityMeasurement);
    }
    return result;
  }

  getVelocityPressureData(inputs: Plane, settings: Settings): { pv3: number, percent75Rule: number } {
    inputs = this.convertFsatService.convertPlaneForCalculations(inputs, settings);
    let results: { pv3: number, percent75Rule: number } = fanAddon.getVelocityPressureData(inputs);
    if (settings.fanPressureMeasurement != 'inH2o') {
      results.pv3 = this.convertUnitsService.value(results.pv3).from('inH2o').to(settings.fanPressureMeasurement);
    }
    return results;
  }

  getPlaneResults(input: Fan203Inputs, settings: Settings): PlaneResults {
    input = this.convertFsatService.convertFan203DataForCalculations(input, settings);
    let results: PlaneResults = fanAddon.getPlaneResults(input);
    results = this.convertFsatService.convertPlaneResults(results, settings);
    return results;
  }

  fanCurve() {
    return fanAddon.fanCurve();
  }

  getInput(fsat: FSAT, settings: Settings) {
    let input: FsatInput = {
      fanSpeed: fsat.fanSetup.fanSpeed,
      drive: fsat.fanSetup.drive,
      specifiedDriveEfficiency: fsat.fanSetup.specifiedDriveEfficiency | 100,
      lineFrequency: fsat.fanMotor.lineFrequency,
      motorRatedPower: fsat.fanMotor.motorRatedPower,
      motorRpm: fsat.fanMotor.motorRpm,
      efficiencyClass: fsat.fanMotor.efficiencyClass,
      fanEfficiency: fsat.fanSetup.fanEfficiency,
      //motor
      specifiedEfficiency: fsat.fanMotor.specifiedEfficiency,
      motorRatedVoltage: fsat.fanMotor.motorRatedVoltage,
      fullLoadAmps: fsat.fanMotor.fullLoadAmps,
      sizeMargin: 1,
      measuredVoltage: fsat.fieldData.measuredVoltage,
      //???????
      measuredAmps: fsat.fieldData.motorPower,
      flowRate: fsat.fieldData.flowRate,
      inletPressure: fsat.fieldData.inletPressure,
      outletPressure: fsat.fieldData.outletPressure,
      compressibilityFactor: fsat.fieldData.compressibilityFactor,
      operatingHours: fsat.fieldData.operatingHours,
      unitCost: fsat.fieldData.cost,
      airDensity: fsat.baseGasDensity.gasDensity
    };

    input = this.convertFsatService.convertInputDataForCalculations(input, settings);
    return input;
  }

  //fsat results
  getResults(fsat: FSAT, isBaseline: boolean, settings: Settings): FsatOutput {
    if (this.checkValid(fsat, isBaseline)) {
      if (!fsat.fieldData.operatingHours && fsat.fieldData.operatingFraction) {
        fsat.fieldData.operatingHours = fsat.fieldData.operatingFraction * 8760;
      }
      let input: FsatInput = {
        fanSpeed: fsat.fanSetup.fanSpeed,
        drive: fsat.fanSetup.drive,
        specifiedDriveEfficiency: fsat.fanSetup.specifiedDriveEfficiency | 100,
        lineFrequency: fsat.fanMotor.lineFrequency,
        motorRatedPower: fsat.fanMotor.motorRatedPower,
        motorRpm: fsat.fanMotor.motorRpm,
        efficiencyClass: fsat.fanMotor.efficiencyClass,
        fanEfficiency: fsat.fanSetup.fanEfficiency,
        //motor
        specifiedEfficiency: fsat.fanMotor.specifiedEfficiency,
        motorRatedVoltage: fsat.fanMotor.motorRatedVoltage,
        fullLoadAmps: fsat.fanMotor.fullLoadAmps,
        measuredVoltage: fsat.fieldData.measuredVoltage,
        //???????
        measuredAmps: fsat.fieldData.motorPower,
        flowRate: fsat.fieldData.flowRate,
        inletPressure: fsat.fieldData.inletPressure,
        outletPressure: fsat.fieldData.outletPressure,
        compressibilityFactor: fsat.fieldData.compressibilityFactor,
        operatingHours: fsat.fieldData.operatingHours,
        unitCost: fsat.fieldData.cost,
        airDensity: fsat.baseGasDensity.gasDensity,
        sizeMargin: 1
      };

      input = this.convertFsatService.convertInputDataForCalculations(input, settings);
      let results: FsatOutput;
      if (isBaseline) {
        input.loadEstimationMethod = fsat.fieldData.loadEstimatedMethod;
        input.measuredPower = fsat.fieldData.motorPower;
        results = this.fanResultsExisting(input);
      } else {
        input.fanType = fsat.fanSetup.fanType;
        results = this.fanResultsModified(input);
      }
      results = this.convertFsatService.convertFsatOutput(results, settings);
      results.annualCost = results.annualCost * 1000;
      return results;
    } else {
      return this.getEmptyResults();
    }
  }


  fanResultsExisting(input: FsatInput): FsatOutput {
    return fanAddon.fanResultsExisting(input);
  }
  fanResultsModified(input: FsatInput): FsatOutput {
    return fanAddon.fanResultsModified(input);
  }
  // fanResultsOptimal(input: FsatInput): FsatOutput {
  //   return fanAddon.fanResultsOptimal(input);
  // }

  getSavingsPercentage(baselineCost: number, modificationCost: number): number {
    let tmpSavingsPercent = Number(Math.round(((((baselineCost - modificationCost) * 100) / baselineCost) * 100) / 100).toFixed(0));
    return tmpSavingsPercent;
  }

  checkValid(fsat: FSAT, isBaseline: boolean): boolean {
    let fsatFluidValid: boolean = this.checkFsatFluidValid(fsat);
    let fieldDataValid: boolean = this.checkFieldDataValid(fsat);
    let fanSetupValid: boolean = this.checkFanSetupValid(fsat, isBaseline);
    let fanMotorValid: boolean = this.checkFanMotorValid(fsat);
    return (fieldDataValid && fanSetupValid && fanMotorValid && fsatFluidValid);
  }

  checkFieldDataValid(fsat: FSAT): boolean {
    let fanFieldDataForm: FormGroup = this.fanFieldDataService.getFormFromObj(fsat.fieldData);
    return (fanFieldDataForm.status == 'VALID');
  }

  checkFanSetupValid(fsat: FSAT, isBaseline: boolean): boolean {
    let fanSetupForm: FormGroup = this.fanSetupService.getFormFromObj(fsat.fanSetup, !isBaseline);
    return (fanSetupForm.status == 'VALID');
  }

  checkFanMotorValid(fsat: FSAT): boolean {
    let fanMotorForm: FormGroup = this.fanMotorService.getFormFromObj(fsat.fanMotor);
    return (fanMotorForm.status == 'VALID');
  }

  checkFsatFluidValid(fsat: FSAT): boolean {
    let fluidForm: FormGroup = this.fsatFluidService.getGasDensityFormFromObj(fsat.baseGasDensity);
    return (fluidForm.status == 'VALID');
  }


  optimalFanEfficiency(inputs: FanEfficiencyInputs, settings: Settings): number {
    if (settings.fanFlowRate != 'ft3/min') {
      inputs.flowRate = this.convertUnitsService.value(inputs.flowRate).from('m2').to('ft2');

    }

    if (settings.fanPressureMeasurement != 'inH2o') {
      inputs.inletPressure = this.convertUnitsService.value(inputs.inletPressure).from(settings.fanPressureMeasurement).to('inH2o');
      inputs.outletPressure = this.convertUnitsService.value(inputs.outletPressure).from(settings.fanPressureMeasurement).to('inH2o');
    }
    return fanAddon.optimalFanEfficiency(inputs);
  }

  getEmptyResults(): FsatOutput {
    let emptyResults: FsatOutput = {
      fanEfficiency: 0,
      motorRatedPower: 0,
      motorShaftPower: 0,
      fanShaftPower: 0,
      motorEfficiency: 0,
      motorPowerFactor: 0,
      motorCurrent: 0,
      motorPower: 0,
      loadFactor: 0,
      driveEfficiency: 0,
      annualEnergy: 0,
      annualCost: 0,
      fanEnergyIndex: 0,
      //modified
      estimatedFLA: 0,
      percentSavings: 0,
      energySavings: 0,
      annualSavings: 0
    }
    return emptyResults;
  }

  compressibilityFactor(inputs: CompressibilityFactor, settings: Settings) {
    let inputCpy: CompressibilityFactor = JSON.parse(JSON.stringify(inputs));
    if (settings.fanFlowRate != 'ft3/min') {
      inputCpy.flowRate = this.convertUnitsService.value(inputCpy.flowRate).from('m2').to('ft2');

    }
    if (settings.fanPressureMeasurement != 'inH2o') {
      inputCpy.inletPressure = this.convertUnitsService.value(inputCpy.inletPressure).from(settings.fanPressureMeasurement).to('inH2o');
      inputCpy.outletPressure = this.convertUnitsService.value(inputCpy.outletPressure).from(settings.fanPressureMeasurement).to('inH2o');
    }
    if (settings.fanBarometricPressure != 'inHg') {
      inputCpy.barometricPressure = this.convertUnitsService.value(inputCpy.barometricPressure).from(settings.fanBarometricPressure).to('inHg');
    }
    if (settings.fanPowerMeasurement != 'hp') {
      inputCpy.moverShaftPower = this.convertUnitsService.value(inputCpy.moverShaftPower).from('hp').to(settings.fanPowerMeasurement);
    }
    return fanAddon.compressibilityFactor(inputCpy);
  }


  getNewMod(fsat: FSAT, settings: Settings): Modification {
    let modName: string = 'Scenario ' + (fsat.modifications.length + 1);
    let tmpModification: Modification = {
      fsat: {
        name: modName,
        notes: {
          fieldDataNotes: '',
          fanMotorNotes: '',
          fanSetupNotes: '',
          fluidNotes: ''
        }
      },
      exploreOpportunities: (this.assessmentTab.value == 'explore-opportunities')
    }
    let tmpBaselineResults: FsatOutput = this.getResults(fsat, true, settings);
    let fsatCopy: FSAT = (JSON.parse(JSON.stringify(fsat)));
    tmpModification.fsat.baseGasDensity = fsatCopy.baseGasDensity;
    tmpModification.fsat.fanMotor = fsatCopy.fanMotor;
    tmpModification.fsat.fanSetup = fsatCopy.fanSetup;
    //specified, set effeciency to calculated baseline efficiency
    tmpModification.fsat.fanSetup.fanType = 12;
    tmpModification.fsat.fanSetup.fanEfficiency = this.convertUnitsService.roundVal(tmpBaselineResults.fanEfficiency, 2);
    tmpModification.fsat.fieldData = fsatCopy.fieldData;
    return tmpModification
  }
}

