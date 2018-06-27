import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Fan203Inputs, BaseGasDensity, PlaneData, Plane, Modification, FSAT, FsatInput, FsatOutput, PlaneResults, Fan203Results } from '../shared/models/fans';
import { FanFieldDataService } from './fan-field-data/fan-field-data.service';
import { FanSetupService } from './fan-setup/fan-setup.service';
import { FanMotorService } from './fan-motor/fan-motor.service';
import { FormGroup } from '@angular/forms';
import { FsatFluidService } from './fsat-fluid/fsat-fluid.service';
import { Settings } from '../shared/models/settings';
import { ConvertFsatService } from './convert-fsat.service';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';


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
    //TODO: convert input
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

  //fsat results

  getResults(fsat: FSAT, resultType: string, settings: Settings): FsatOutput {
    if (this.checkValid(fsat)) {
      let input: FsatInput = {
        fanSpeed: fsat.fanSetup.fanSpeed,
        drive: fsat.fanSetup.drive,
        lineFrequency: fsat.fanMotor.lineFrequency,
        motorRatedPower: fsat.fanMotor.motorRatedPower,
        motorRpm: fsat.fanMotor.motorRpm,
        efficiencyClass: fsat.fanMotor.efficiencyClass,
        fanEfficiency: fsat.fanSetup.fanEfficiency | 0,
        //motor
        specifiedEfficiency: fsat.fanMotor.specifiedEfficiency,
        motorRatedVoltage: fsat.fanMotor.motorRatedVoltage,
        fullLoadAmps: fsat.fanMotor.fullLoadAmps,
        sizeMargin: fsat.fanMotor.sizeMargin | 0,
        measuredVoltage: fsat.fieldData.measuredVoltage,
        //???????
        measuredAmps: fsat.fieldData.motorPower,
        flowRate: fsat.fieldData.flowRate,
        inletPressure: fsat.fieldData.inletPressure,
        outletPressure: fsat.fieldData.outletPressure,
        compressibilityFactor: fsat.fieldData.compressibilityFactor,
        operatingFraction: fsat.fieldData.operatingFraction,
        unitCost: fsat.fieldData.cost,
        airDensity: fsat.baseGasDensity.gasDensity,
        isSpecified: false
      };

      input = this.convertFsatService.convertInputDataForCalculations(input, settings);
      let results: FsatOutput;
      if (resultType == 'existing') {
        input.loadEstimationMethod = fsat.fieldData.loadEstimatedMethod;
        input.measuredPower = fsat.fieldData.motorPower;
        results = this.fanResultsExisting(input);
      } else if (resultType == 'optimal') {
        input.fanType = fsat.fanSetup.fanType;
        if (fsat.fanSetup.fanType == 12) {
          input.isSpecified = true;
          input.userInputFanEfficiency = fsat.fanSetup.fanSpecified;
        }
        results = this.fanResultsOptimal(input);
      } else if (resultType == 'modified') {
        input.fanType = fsat.fanSetup.fanType;
        if (fsat.fanSetup.fanType == 12) {
          input.isSpecified = true;
          input.userInputFanEfficiency = fsat.fanSetup.fanSpecified;
        }
        results = this.fanResultsModified(input);
      }
      results = this.convertFsatService.convertFsatOutput(results, settings);
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
  fanResultsOptimal(input: FsatInput): FsatOutput {
    return fanAddon.fanResultsOptimal(input);
  }


  getSavingsPercentage(baselineCost: number, modificationCost: number): number {
    let tmpSavingsPercent = Number(Math.round(((((baselineCost - modificationCost) * 100) / baselineCost) * 100) / 100).toFixed(0));
    return tmpSavingsPercent;
  }

  checkValid(fsat: FSAT): boolean {
    let fsatFluidValid: boolean = this.checkFsatFluidValid(fsat);
    let fieldDataValid: boolean = this.checkFieldDataValid(fsat);
    let fanSetupValid: boolean = this.checkFanSetupValid(fsat);
    let fanMotorValid: boolean = this.checkFanMotorValid(fsat);
    return (fieldDataValid && fanSetupValid && fanMotorValid && fsatFluidValid);
  }

  checkFieldDataValid(fsat: FSAT): boolean {
    let fanFieldDataForm: FormGroup = this.fanFieldDataService.getFormFromObj(fsat.fieldData);
    return (fanFieldDataForm.status == 'VALID');
  }

  checkFanSetupValid(fsat: FSAT): boolean {
    let fanSetupForm: FormGroup = this.fanSetupService.getFormFromObj(fsat.fanSetup);
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
}

