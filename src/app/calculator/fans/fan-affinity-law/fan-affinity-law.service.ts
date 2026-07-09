import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { FanAffinityLawsInput, FanAffinityLawsOutput } from '../../../shared/models/standalone';
import { FanAffinityLawApiService } from '../../../tools-suite-api/fan-affinity-law-api.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class FanAffinityLawService {

  fanAffinityLawInputs: FanAffinityLawsInput;

  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService,
    private fanAffinityLawApiService: FanAffinityLawApiService) { }

  initObject(settings: Settings): FanAffinityLawsInput {
    let electricalRate: number = 0.12;
    if (settings) {
      electricalRate = settings.electricityCost;
    }
    let obj: FanAffinityLawsInput = {
      hoursOperation: 8760,
      electricalRate: electricalRate,
      efficiencyMotor: 100,
      powerMotor: 1,
      ratedFlow: 1,
      actualFlow: 1,
      motorControlTypeCurrent: 0,
      motorControlTypeNew: 3,
      flowMode: 0,
      desiredFlowVolume: 0,
      desiredFlowPercent: 100,
      diameterFan: 0,
      changeFanSize: false,
      diameterFanNew: 0,
      efficiencyDrive: 100
    };
    return obj;
  }

  getFormFromObj(inputObj: FanAffinityLawsInput): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      hoursOperation: [inputObj.hoursOperation, [Validators.required, Validators.min(0), Validators.max(8760)]],
      electricalRate: [inputObj.electricalRate, [Validators.required, Validators.min(0)]],
      efficiencyMotor: [inputObj.efficiencyMotor, [Validators.required, Validators.min(0), Validators.max(100)]],
      powerMotor: [inputObj.powerMotor, [Validators.required, Validators.min(0)]],
      ratedFlow: [inputObj.ratedFlow, [Validators.required, Validators.min(0)]],
      actualFlow: [inputObj.actualFlow, [Validators.required, Validators.min(0)]],
      motorControlTypeCurrent: [inputObj.motorControlTypeCurrent, [Validators.required]],
      motorControlTypeNew: [inputObj.motorControlTypeNew, [Validators.required]],
      flowMode: [inputObj.flowMode, [Validators.required]],
      desiredFlowVolume: [inputObj.desiredFlowVolume],
      desiredFlowPercent: [inputObj.desiredFlowPercent],
      diameterFan: [inputObj.diameterFan],
      changeFanSize: [inputObj.changeFanSize],
      diameterFanNew: [inputObj.diameterFanNew],
      efficiencyDrive: [inputObj.efficiencyDrive, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
    form = this.setValidators(form);
    return form;
  }

  setValidators(form: UntypedFormGroup): UntypedFormGroup {
    if (form.controls.flowMode.value === 1) {
      form.controls.desiredFlowVolume.setValidators([Validators.required, Validators.min(0)]);
      form.controls.desiredFlowPercent.clearValidators();
    } else {
      form.controls.desiredFlowPercent.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      form.controls.desiredFlowVolume.clearValidators();
    }
    form.controls.desiredFlowVolume.updateValueAndValidity();
    form.controls.desiredFlowPercent.updateValueAndValidity();

    form.controls.diameterFan.setValidators([Validators.required, GreaterThanValidator.greaterThan(0)]);
    if (form.controls.changeFanSize.value) {
      form.controls.diameterFanNew.setValidators([Validators.required, GreaterThanValidator.greaterThan(form.controls.diameterFan.value)]);
    } else {
      // form.controls.diameterFan.clearValidators();
      form.controls.diameterFanNew.clearValidators();
    }
    form.controls.diameterFan.updateValueAndValidity();
    form.controls.diameterFanNew.updateValueAndValidity();
    return form;
  }

  getObjFromForm(form: UntypedFormGroup): FanAffinityLawsInput {
    let obj: FanAffinityLawsInput = {
      hoursOperation: form.controls.hoursOperation.value,
      electricalRate: form.controls.electricalRate.value,
      efficiencyMotor: form.controls.efficiencyMotor.value,
      powerMotor: form.controls.powerMotor.value,
      ratedFlow: form.controls.ratedFlow.value,
      actualFlow: form.controls.actualFlow.value,
      motorControlTypeCurrent: form.controls.motorControlTypeCurrent.value,
      motorControlTypeNew: form.controls.motorControlTypeNew.value,
      flowMode: form.controls.flowMode.value,
      desiredFlowVolume: form.controls.desiredFlowVolume.value,
      desiredFlowPercent: form.controls.desiredFlowPercent.value,
      diameterFan: form.controls.diameterFan.value,
      changeFanSize: form.controls.changeFanSize.value,
      diameterFanNew: form.controls.diameterFanNew.value,
      efficiencyDrive: form.controls.efficiencyDrive.value
    };
    return obj;
  }

  getResults(inputs: FanAffinityLawsInput, settings: Settings, modificationExists: boolean = true): FanAffinityLawsOutput {
    let inputsCpy: FanAffinityLawsInput = JSON.parse(JSON.stringify(inputs));
    inputsCpy = this.convertInputs(inputsCpy, settings);
    let results: FanAffinityLawsOutput;
    if (inputsCpy.changeFanSize) {
      results = this.fanAffinityLawApiService.changeFanSize(inputsCpy, inputsCpy.diameterFan, inputsCpy.diameterFanNew);
    } else {
      results = this.fanAffinityLawApiService.calculate(inputsCpy);
    }
    Object.assign(results, this.getIntermediateValues(inputsCpy, settings));
    if (!modificationExists) {
      results.annualEnergyNew = results.annualEnergyBaseline;
      results.annualCostSavings = 0;
    }
    return results;
  }

  // Mirrors FanAffinityLaws::compute() in MEASUR-Tools-Suite (bindings-wasm/motorDriven/fans/fan_affinity_laws.cpp),
  // which only returns the 3 aggregate Output fields. These intermediates are recomputed here purely for display
  // in the results table since the wasm module doesn't expose them.
  getIntermediateValues(inputs: FanAffinityLawsInput, settings: Settings): Partial<FanAffinityLawsOutput> {
    const motorEfficiency: number = inputs.efficiencyMotor / 100;
    const driveEfficiency: number = inputs.efficiencyDrive / 100;
    const baselinePower: number = inputs.powerMotor / motorEfficiency / driveEfficiency;
    const baselineFlowPercent: number = Math.min(100, Math.max(0, (inputs.actualFlow / inputs.ratedFlow) * 100));

    let desiredFlowPercent: number;
    let desiredFlowVolume: number;
    if (inputs.flowMode === 1) {
      desiredFlowVolume = inputs.desiredFlowVolume;
      desiredFlowPercent = (inputs.desiredFlowVolume / inputs.ratedFlow) * 100;
    } else {
      desiredFlowPercent = inputs.desiredFlowPercent;
      desiredFlowVolume = (inputs.desiredFlowPercent / 100) * inputs.ratedFlow;
    }

    const ratedFlow: number = this.convertFlowForDisplay(inputs.ratedFlow, settings);
    const values: Partial<FanAffinityLawsOutput> = { ratedFlow, baselinePower, baselineFlowPercent };

    if (inputs.motorControlTypeCurrent === 1) {
      // Current Motor Control is Two-Speed, so the baseline power also runs on the same duty-cycle
      // assumption as a new Two-Speed selection (see FanAffinityLaws::compute() powerCurrent branch).
      const baselineTimeFactor = this.get50PercentTimeFactor(baselineFlowPercent / 100);
      values.baselineTimeAbove50Percent = baselineTimeFactor.timeAbove50Percent * 100;
      values.baselineTimeAt0Percent = baselineTimeFactor.timeAt0Percent * 100;
      values.baselineTimeAt50Percent = baselineTimeFactor.timeAt50Percent * 100;
    }

    if (!inputs.changeFanSize && inputs.motorControlTypeNew === 2) {
      // VSD
      values.scenario = 'vsd';
      values.desiredFlowPercent = desiredFlowPercent;
      values.desiredFlowVolume = this.convertFlowForDisplay(desiredFlowVolume, settings);
      values.newPower = baselinePower * Math.pow(desiredFlowPercent / 100, 3);
    } else if (inputs.motorControlTypeNew === 1) {
      // Two-Speed
      const timeFactor = this.get50PercentTimeFactor(desiredFlowPercent / 100);
      values.scenario = 'twoSpeed';
      values.desiredFlowPercent = desiredFlowPercent;
      values.desiredFlowVolume = this.convertFlowForDisplay(desiredFlowVolume, settings);
      values.timeAbove50Percent = timeFactor.timeAbove50Percent * 100;
      values.timeAt0Percent = timeFactor.timeAt0Percent * 100;
      values.timeAt50Percent = timeFactor.timeAt50Percent * 100;
      values.newPower = baselinePower * timeFactor.factor;
    } else if (inputs.changeFanSize && inputs.motorControlTypeNew === 3) {
      // Change Fan Size only
      const fanDiameterRatio: number = inputs.diameterFanNew / inputs.diameterFan;
      const newFanFlow: number = inputs.ratedFlow * Math.pow(fanDiameterRatio, 3);
      values.scenario = 'changeFanSize';
      values.fanDiameterRatio = fanDiameterRatio * 100;
      values.newFlowPercent = (newFanFlow / inputs.ratedFlow) * 100;
      values.newPower = baselinePower * Math.pow(fanDiameterRatio, 5);
    } else if (inputs.changeFanSize && inputs.motorControlTypeNew === 2) {
      // VSD + Change Fan Size
      const fanDiameterRatio: number = inputs.diameterFanNew / inputs.diameterFan;
      const newFanRatedFlow: number = inputs.ratedFlow * Math.pow(fanDiameterRatio, 3);
      const newFlowPercent: number = desiredFlowVolume / newFanRatedFlow;
      values.scenario = 'vsdChangeFanSize';
      values.desiredFlowPercent = desiredFlowPercent;
      values.desiredFlowVolume = this.convertFlowForDisplay(desiredFlowVolume, settings);
      values.fanDiameterRatio = fanDiameterRatio * 100;
      values.newFanRatedFlow = this.convertFlowForDisplay(newFanRatedFlow, settings);
      values.newFlowPercent = newFlowPercent * 100;
      values.newPower = baselinePower * Math.pow(newFlowPercent, 3) * Math.pow(fanDiameterRatio, 5);
    } else if (inputs.changeFanSize && inputs.motorControlTypeNew === 1) {
      // Two-Speed + Change Fan Size
      const fanDiameterRatio: number = inputs.diameterFanNew / inputs.diameterFan;
      const newFanRatedFlow: number = inputs.ratedFlow * Math.pow(fanDiameterRatio, 3);
      const timeFactor = this.get50PercentTimeFactor(desiredFlowPercent / 100);
      values.scenario = 'twoSpeedChangeFanSize';
      values.desiredFlowPercent = desiredFlowPercent;
      values.desiredFlowVolume = this.convertFlowForDisplay(desiredFlowVolume, settings);
      values.fanDiameterRatio = fanDiameterRatio * 100;
      values.newFanRatedFlow = this.convertFlowForDisplay(newFanRatedFlow, settings);
      values.newFlowPercent = (desiredFlowVolume / newFanRatedFlow) * 100;
      values.newPower = baselinePower * timeFactor.factor * Math.pow(fanDiameterRatio, 5);
    } else {
      values.scenario = 'none';
    }

    return values;
  }

  private get50PercentTimeFactor(flowPercent: number): { timeAbove50Percent: number, timeAt0Percent: number, timeAt50Percent: number, factor: number } {
    const timeAbove50Percent: number = Math.max(0, (flowPercent - 0.5) / 0.5);
    const timeAt0Percent: number = Math.max(0, (0.5 - flowPercent) / 0.5);
    const timeAt50Percent: number = 1 - timeAbove50Percent - timeAt0Percent;
    return { timeAbove50Percent, timeAt0Percent, timeAt50Percent, factor: timeAbove50Percent + timeAt50Percent * 0.125 };
  }

  // flow intermediates are computed in calculation units (ft3/min); convert back to m3/s for metric display
  private convertFlowForDisplay(cfmValue: number, settings: Settings): number {
    if (settings.unitsOfMeasure === 'Imperial') {
      return cfmValue;
    }
    return this.convertUnitsService.value(cfmValue).from('ft3/min').to('m3/s');
  }

  // form/display values are stored in the current settings unit system; the wasm calculation
  // expects powerMotor in kW, and ratedFlow/actualFlow/desiredFlowVolume/diameterFan/diameterFanNew in ft3/min & in
  convertInputs(inputs: FanAffinityLawsInput, settings: Settings): FanAffinityLawsInput {
    if (settings.unitsOfMeasure == 'Imperial') {
      inputs.powerMotor = this.convertUnitsService.value(inputs.powerMotor).from('hp').to('kW');
    } else {
      inputs.ratedFlow = this.convertUnitsService.value(inputs.ratedFlow).from('m3/s').to('ft3/min');
      inputs.actualFlow = this.convertUnitsService.value(inputs.actualFlow).from('m3/s').to('ft3/min');
      inputs.desiredFlowVolume = this.convertUnitsService.value(inputs.desiredFlowVolume).from('m3/s').to('ft3/min');
      inputs.diameterFan = this.convertUnitsService.value(inputs.diameterFan).from('cm').to('in');
      inputs.diameterFanNew = this.convertUnitsService.value(inputs.diameterFanNew).from('cm').to('in');
    }
    return inputs;
  }

  generateExample(settings: Settings): FanAffinityLawsInput {
    let powerMotor: number = 100;
    let ratedFlow: number = 10000;
    let actualFlow: number = 10000;
    let desiredFlowVolume: number = 8000;
    let diameterFan: number = 36;
    let diameterFanNew: number = 36;

    if (settings.unitsOfMeasure != 'Imperial') {
      powerMotor = this.convertUnitsService.value(powerMotor).from('hp').to('kW');
      powerMotor = Number(powerMotor.toFixed(3));
      ratedFlow = this.convertUnitsService.value(ratedFlow).from('ft3/min').to('m3/s');
      ratedFlow = Number(ratedFlow.toFixed(3));
      actualFlow = this.convertUnitsService.value(actualFlow).from('ft3/min').to('m3/s');
      actualFlow = Number(actualFlow.toFixed(3));
      desiredFlowVolume = this.convertUnitsService.value(desiredFlowVolume).from('ft3/min').to('m3/s');
      desiredFlowVolume = Number(desiredFlowVolume.toFixed(3));
      diameterFan = this.convertUnitsService.value(diameterFan).from('in').to('cm');
      diameterFan = Number(diameterFan.toFixed(3));
      diameterFanNew = this.convertUnitsService.value(diameterFanNew).from('in').to('cm');
      diameterFanNew = Number(diameterFanNew.toFixed(3));
    }

    let exampleData: FanAffinityLawsInput = {
      hoursOperation: 8760,
      electricalRate: .066,
      efficiencyMotor: 90,
      powerMotor: powerMotor,
      ratedFlow: ratedFlow,
      actualFlow: actualFlow,
      motorControlTypeCurrent: 0,
      motorControlTypeNew: 2,
      flowMode: 0,
      desiredFlowVolume: desiredFlowVolume,
      desiredFlowPercent: 80,
      diameterFan: diameterFan,
      changeFanSize: false,
      diameterFanNew: diameterFanNew,
      efficiencyDrive: 95
    };
    return exampleData;
  }
}
