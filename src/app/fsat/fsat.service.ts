import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Fan203Inputs, BaseGasDensity, Plane, Modification, FSAT, FsatInput, FsatOutput, PlaneResults, Fan203Results, CompressibilityFactor, FsatValid, PsychrometricResults, VelocityResults } from '../shared/models/fans';
import { FanFieldDataService } from './fan-field-data/fan-field-data.service';
import { FanSetupService } from './fan-setup/fan-setup.service';
import { FanMotorService } from './fan-motor/fan-motor.service';
import { FsatFluidService } from './fsat-fluid/fsat-fluid.service';
import { Settings } from '../shared/models/settings';
import { ConvertFsatService } from './convert-fsat.service';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { FanEfficiencyInputs } from '../calculator/fans/fan-efficiency/fan-efficiency.service';
import { ConvertFanAnalysisService } from '../calculator/fans/fan-analysis/convert-fan-analysis.service';
import { FormGroup } from '@angular/forms';


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
  constructor(private convertFsatService: ConvertFsatService, private convertUnitsService: ConvertUnitsService, private fanFieldDataService: FanFieldDataService, private convertFanAnalysisService: ConvertFanAnalysisService, private fsatFluidService: FsatFluidService, private fanSetupService: FanSetupService, private fanMotorService: FanMotorService) {
    this.initData();
  }


  initData() {
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.stepTab = new BehaviorSubject<string>('system-basics');
    this.assessmentTab = new BehaviorSubject<string>('explore-opportunities');
    this.calculatorTab = new BehaviorSubject<string>('fan-efficiency');
    this.openNewModal = new BehaviorSubject<boolean>(false);
    this.openModificationModal = new BehaviorSubject<boolean>(false);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.updateData = new BehaviorSubject<boolean>(false);
  }

  test() {
    console.log(fanAddon);
  }

  fan203(input: Fan203Inputs, settings: Settings): Fan203Results {
    let inputCpy: Fan203Inputs = JSON.parse(JSON.stringify(input));
    inputCpy = this.convertFanAnalysisService.convertFan203DataForCalculations(inputCpy, settings);
    inputCpy.FanShaftPower.sumSEF = inputCpy.PlaneData.inletSEF + inputCpy.PlaneData.outletSEF;
    let results: Fan203Results = fanAddon.fan203(inputCpy);
    results = this.convertFanAnalysisService.convertFan203Results(results, settings);
    return results;
  }

  getPsychrometricDewPoint(inputs: BaseGasDensity, settings: Settings): PsychrometricResults {
    inputs = this.convertFanAnalysisService.convertGasDensityForCalculations(inputs, settings);
    let psychrometricResults: PsychrometricResults = fanAddon.getBaseGasDensityDewPoint(inputs);
    psychrometricResults = this.convertFanAnalysisService.convertPsychrometricResults(psychrometricResults, settings);
    return psychrometricResults;
  }

  getPsychrometricRelativeHumidity(inputs: BaseGasDensity, settings: Settings): PsychrometricResults {
    inputs = this.convertFanAnalysisService.convertGasDensityForCalculations(inputs, settings);
    let psychrometricResults: PsychrometricResults = fanAddon.getBaseGasDensityRelativeHumidity(inputs);
    psychrometricResults = this.convertFanAnalysisService.convertPsychrometricResults(psychrometricResults, settings);
    return psychrometricResults;
  }

  getPsychrometricWetBulb(inputs: BaseGasDensity, settings: Settings): PsychrometricResults {
    inputs = this.convertFanAnalysisService.convertGasDensityForCalculations(inputs, settings);
    let psychrometricResults: PsychrometricResults = fanAddon.getBaseGasDensityWetBulb(inputs);
    psychrometricResults = this.convertFanAnalysisService.convertPsychrometricResults(psychrometricResults, settings);
    return psychrometricResults;
  }

  getPsychrometricResults(fsat: FSAT, settings: Settings): PsychrometricResults {
    let psychrometricResults: PsychrometricResults = {
      gasDensity: undefined,
      absolutePressure: undefined,
      saturatedHumidity: undefined,
      saturationDegree: undefined,
      humidityRatio: undefined,
      specificVolume: undefined,
      enthalpy: undefined,
      dewPoint: undefined,
      relativeHumidity: undefined,
      saturationPressure: undefined,
      wetBulbTemp: undefined,
      barometricPressure:undefined,
      dryBulbTemp:undefined,
    };
    let results: PsychrometricResults;
    if (fsat.baseGasDensity.inputType === 'relativeHumidity') {
      results = this.getPsychrometricRelativeHumidity(fsat.baseGasDensity, settings);
    } else if (fsat.baseGasDensity.inputType === 'wetBulb') {
      results = this.getPsychrometricWetBulb(fsat.baseGasDensity, settings);
    } else if (fsat.baseGasDensity.inputType === 'dewPoint') {
      results = this.getPsychrometricDewPoint(fsat.baseGasDensity, settings);
    }

    if (results) {
      psychrometricResults = results;
      psychrometricResults.dryBulbTemp = fsat.baseGasDensity.dryBulbTemp;
      psychrometricResults.barometricPressure = fsat.baseGasDensity.barometricPressure;
    }


    return psychrometricResults;
  }

  getVelocityPressureData(inputs: Plane, settings: Settings): VelocityResults {
    inputs = this.convertFanAnalysisService.convertPlaneForCalculations(inputs, settings);
    let results: VelocityResults = fanAddon.getVelocityPressureData(inputs);
    if (settings.fanPressureMeasurement !== 'inH2o') {
      results.pv3 = this.convertUnitsService.value(results.pv3).from('inH2o').to(settings.fanPressureMeasurement);
    }
    return results;
  }

  getPlaneResults(input: Fan203Inputs, settings: Settings): PlaneResults {
    let inputCpy: Fan203Inputs = JSON.parse(JSON.stringify(input));
    inputCpy = this.convertFanAnalysisService.convertFan203DataForCalculations(inputCpy, settings);
    let results: PlaneResults;
    try {
      results = fanAddon.getPlaneResults(inputCpy);
      results = this.convertFanAnalysisService.convertPlaneResults(results, settings);
    } catch (err) {
      console.log(err);
    }
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
      velocityPressure: fsat.fieldData.inletVelocityPressure,
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
    let fsatValid: FsatValid = this.checkValid(fsat, isBaseline, settings)
    if (fsatValid.isValid) {
      if (!fsat.fieldData.operatingHours && fsat.fieldData.operatingFraction) {
        fsat.fieldData.operatingHours = fsat.fieldData.operatingFraction * 8760;
      }
      let input: FsatInput = {
        fanSpeed: fsat.fanSetup.fanSpeed,
        drive: fsat.fanSetup.drive,
        specifiedDriveEfficiency: fsat.fanSetup.drive === 4 ? fsat.fanSetup.specifiedDriveEfficiency : 100,
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
        velocityPressure: fsat.fieldData.inletVelocityPressure,
        outletPressure: fsat.fieldData.outletPressure,
        compressibilityFactor: fsat.fieldData.compressibilityFactor,
        operatingHours: fsat.fieldData.operatingHours,
        unitCost: fsat.fieldData.cost,
        airDensity: fsat.baseGasDensity.gasDensity,
        sizeMargin: 1
      };
      input = this.convertFsatService.convertInputDataForCalculations(input, settings);
      let results: FsatOutput;
      if (isBaseline || !fsat.whatIfScenario) {
        input.loadEstimationMethod = fsat.fieldData.loadEstimatedMethod;
        input.measuredPower = fsat.fieldData.motorPower;
        results = this.fanResultsExisting(input);
      } else {
        input.fanType = fsat.fanSetup.fanType;
        results = this.fanResultsModified(input);
      }
      results = this.convertFsatService.convertFsatOutput(results, settings);
      results.annualCost = results.annualCost * 1000;

      results.psychrometricResults = this.getPsychrometricResults(fsat, settings);

      let fan203InputsForPlaneResults: Fan203Inputs = this.getFan203InputForPlaneResults(fsat);
      if (fan203InputsForPlaneResults) {
        fsat.fan203InputsForPlaneResults = fan203InputsForPlaneResults;
        results.planeResults = this.getPlaneResults(fan203InputsForPlaneResults, settings);
      }
      return results;
    } else {
      return this.getEmptyResults();
    }
  }

  getFan203InputForPlaneResults(fsat: FSAT): Fan203Inputs {
    let hasFanRatedInfo: boolean = fsat.fieldData.fanRatedInfo !== undefined;
    let hasBaseGasDensity: boolean = fsat.baseGasDensity !== undefined;
    let hasPlaneData: boolean = fsat.fieldData.planeData !== undefined;
    let fan203Inputs: Fan203Inputs;
    if (hasFanRatedInfo && hasBaseGasDensity && hasPlaneData) {
      fan203Inputs = {
        FanRatedInfo: fsat.fieldData.fanRatedInfo,
        BaseGasDensity: fsat.baseGasDensity,
        FanShaftPower: undefined,
        PlaneData: fsat.fieldData.planeData,
      }
    }
    return fan203Inputs;
  }

  fanResultsExisting(input: FsatInput): FsatOutput {
    return fanAddon.fanResultsExisting(input);
  }
  fanResultsModified(input: FsatInput): FsatOutput {
    return fanAddon.fanResultsModified(input);
  }

  getSavingsPercentage(baselineCost: number, modificationCost: number): number {
    let tmpSavingsPercent = Number(Math.round(((((baselineCost - modificationCost) * 100) / baselineCost) * 100) / 100).toFixed(0));
    return tmpSavingsPercent;
  }

  checkValid(fsat: FSAT, isBaseline: boolean, settings): FsatValid {
    let fsatFluidValid: boolean = this.fsatFluidService.isFanFluidValid(fsat.baseGasDensity, settings);
    let fieldDataValid: boolean = this.fanFieldDataService.isFanFieldDataValid(fsat.fieldData);
    let fanSetupValid: boolean = this.fanSetupService.isFanSetupValid(fsat.fanSetup, !isBaseline);
    let fanMotorValid: boolean = this.fanMotorService.isFanMotorValid(fsat.fanMotor);
    return {
      isValid: fieldDataValid && fanSetupValid && fanMotorValid && fsatFluidValid,
      fluidValid: fsatFluidValid,
      fanValid: fanSetupValid,
      motorValid: fanMotorValid,
      fieldDataValid: fieldDataValid

    };
  }

  optimalFanEfficiency(inputs: FanEfficiencyInputs, settings: Settings): number {
    if (settings.fanFlowRate !== 'ft3/min') {
      inputs.flowRate = this.convertUnitsService.value(inputs.flowRate).from('m3').to('ft3');
    }
    inputs.inletPressure = this.convertUnitsService.value(inputs.inletPressure).from(settings.fanPressureMeasurement).to('inH2o');
    inputs.outletPressure = this.convertUnitsService.value(inputs.outletPressure).from(settings.fanPressureMeasurement).to('inH2o');
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
    };
    return emptyResults;
  }

  compressibilityFactor(inputs: CompressibilityFactor, settings: Settings) {
    let inputCpy: CompressibilityFactor = JSON.parse(JSON.stringify(inputs));
    inputCpy.flowRate = this.convertUnitsService.value(inputCpy.flowRate).from(settings.fanFlowRate).to('ft3/min');
    inputCpy.inletPressure = this.convertUnitsService.value(inputCpy.inletPressure).from(settings.fanPressureMeasurement).to('inH2o');
    inputCpy.outletPressure = this.convertUnitsService.value(inputCpy.outletPressure).from(settings.fanPressureMeasurement).to('inH2o');
    inputCpy.barometricPressure = this.convertUnitsService.value(inputCpy.barometricPressure).from(settings.fanBarometricPressure).to('inHg');
    inputCpy.moverShaftPower = this.convertUnitsService.value(inputCpy.moverShaftPower).from(settings.fanPowerMeasurement).to('hp');
    return fanAddon.compressibilityFactor(inputCpy);
  }

  calculateInletVelocityPressure(calculationInputs: InletVelocityPressureInputs): number {
    let inletVelocityPressure: number;
    let flowRateCalc: number = (1 / 1096) * (calculationInputs.flowRate / calculationInputs.ductArea);
    inletVelocityPressure = calculationInputs.gasDensity * Math.pow(flowRateCalc, 2);
    if (isNaN(inletVelocityPressure) || !isFinite(inletVelocityPressure)) {
      inletVelocityPressure = undefined;
    } else {
      inletVelocityPressure = Number(inletVelocityPressure.toFixed(5));
    }
    return inletVelocityPressure;
  }


  getNewMod(fsat: FSAT, settings: Settings): Modification {
    let modNum: number = 1;
    if (fsat.modifications) {
      modNum = fsat.modifications.length + 1;
    }
    let modName: string = 'Scenario ' + modNum;
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
      exploreOpportunities: (this.assessmentTab.value === 'explore-opportunities')
    };
    let tmpBaselineResults: FsatOutput = this.getResults(fsat, true, settings);
    let fsatCopy: FSAT = (JSON.parse(JSON.stringify(fsat)));
    tmpModification.fsat.baseGasDensity = fsatCopy.baseGasDensity;
    tmpModification.fsat.fanMotor = fsatCopy.fanMotor;
    tmpModification.fsat.fanSetup = fsatCopy.fanSetup;
    //specified, set efficiency to calculated baseline efficiency
    tmpModification.fsat.fanSetup.fanType = 12;
    tmpModification.fsat.fanSetup.fanEfficiency = this.convertUnitsService.roundVal(tmpBaselineResults.fanEfficiency, 2);
    tmpModification.fsat.fieldData = fsatCopy.fieldData;
    tmpModification.fsat.whatIfScenario = true;
    return tmpModification;
  }
}

export interface InletVelocityPressureInputs {
  gasDensity: number,
  flowRate: number,
  ductArea: number
}