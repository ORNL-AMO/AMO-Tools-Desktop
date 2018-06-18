import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Fan203Inputs, BaseGasDensity, PlaneData, Plane, Modification, FSAT, FsatInput, FsatOutput } from '../shared/models/fans';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { FanFieldDataService } from './fan-field-data/fan-field-data.service';
import { FanSetupService } from './fan-setup/fan-setup.service';
import { FanMotorService } from './fan-motor/fan-motor.service';
import { FormGroup } from '@angular/forms';
import { FsatFluidService } from './fsat-fluid/fsat-fluid.service';
import { Settings } from '../shared/models/settings';

declare var fanAddon: any;

@Injectable()
export class FsatService {


  mainTab: BehaviorSubject<string>;
  stepTab: BehaviorSubject<string>;
  assessmentTab: BehaviorSubject<string>;
  openNewModal: BehaviorSubject<boolean>;
  openModificationModal: BehaviorSubject<boolean>;
  modalOpen: BehaviorSubject<boolean>;
  constructor(private convertUnitsService: ConvertUnitsService, private fanFieldDataService: FanFieldDataService, private fsatFluidService: FsatFluidService, private fanSetupService: FanSetupService, private fanMotorService: FanMotorService) {
    this.initData();
  }


  initData() {
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.stepTab = new BehaviorSubject<string>('system-basics');
    this.assessmentTab = new BehaviorSubject<string>('explore-opportunities');
    this.openNewModal = new BehaviorSubject<boolean>(false);
    this.openModificationModal = new BehaviorSubject<boolean>(false);
    this.modalOpen = new BehaviorSubject<boolean>(false);
  }

  test() {
    console.log(fanAddon);
  }

  fan203(input: Fan203Inputs) {
    input.FanShaftPower.sumSEF = input.PlaneData.inletSEF + input.PlaneData.outletSEF;
    return fanAddon.fan203(input);
  }

  getBaseGasDensityDewPoint(inputs: BaseGasDensity): number {
    return fanAddon.getBaseGasDensityDewPoint(inputs);
  }

  getBaseGasDensityRelativeHumidity(inputs: BaseGasDensity): number {
    return fanAddon.getBaseGasDensityRelativeHumidity(inputs);
  }

  getBaseGasDensityWetBulb(inputs: BaseGasDensity): number {
    return fanAddon.getBaseGasDensityWetBulb(inputs);
  }

  getVelocityPressureData(inputs: Plane) {
    return fanAddon.getVelocityPressureData(inputs);
  }

  getPlaneResults(input: Fan203Inputs) {
    return fanAddon.getPlaneResults(input);
  }

  fanCurve() {
    return fanAddon.fanCurve();
  }

  //fsat results

  getResults(fsat: FSAT, resultType: string): FsatOutput {
    if (this.checkValid(fsat)) {
      let input: FsatInput = {
        fanSpeed: fsat.fanSetup.fanSpeed,
        drive: fsat.fanSetup.drive,
        lineFrequency: fsat.fanMotor.lineFrequency,
        motorRatedPower: fsat.fanMotor.motorRatedPower,
        motorRpm: fsat.fanMotor.motorRpm,
        efficiencyClass: fsat.fanMotor.efficiencyClass,
        fanEfficiency: fsat.fanSetup.fanEfficiency,
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
      if (resultType == 'existing') {
        input.loadEstimationMethod = fsat.fieldData.loadEstimatedMethod;
        input.measuredPower = fsat.fieldData.motorPower;
        return this.fanResultsExisting(input);
      } else if (resultType == 'optimal') {
        input.fanType = fsat.fanSetup.fanType;
        if (fsat.fanSetup.fanType == 12) {
          input.isSpecified = true;
          input.userInputFanEfficiency = fsat.fanSetup.fanSpecified;
        }
        return this.fanResultsOptimal(input);
      } else if (resultType == 'modified') {
        input.fanType = fsat.fanSetup.fanType;
        if (fsat.fanSetup.fanType == 12) {
          input.isSpecified = true;
          input.userInputFanEfficiency = fsat.fanSetup.fanSpecified;
        }
        return this.fanResultsModified(input);
      }
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

