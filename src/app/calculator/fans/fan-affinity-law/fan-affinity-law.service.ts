import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { FanAffinityLawsInput, FanAffinityLawsOutput, FanAffinityLawsTimeFactors } from '../../../shared/models/standalone';
import { FanAffinityLawApiService } from '../../../tools-suite-api/fan-affinity-law-api.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class FanAffinityLawService {
  fanAffinityLawInputs: FanAffinityLawsInput;

  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService,
    private fanAffinityLawApiService: FanAffinityLawApiService) {}

  private numericValidators(positive: boolean = true): ValidatorFn[] {
    return [Validators.required,
      positive ? GreaterThanValidator.greaterThan(0) : Validators.min(0)];
  }

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

  getFormFromObj(inputObj: FanAffinityLawsInput, modificationExists: boolean = true): UntypedFormGroup {
    const form: UntypedFormGroup = this.formBuilder.group({
      hoursOperation: [inputObj.hoursOperation, [...this.numericValidators(), Validators.max(8760)]],
      electricalRate: [inputObj.electricalRate, this.numericValidators(false)],
      efficiencyMotor: [inputObj.efficiencyMotor, [...this.numericValidators(), Validators.max(100)]],
      powerMotor: [inputObj.powerMotor, this.numericValidators()],
      ratedFlow: [inputObj.ratedFlow, this.numericValidators()],
      actualFlow: [inputObj.actualFlow],
      motorControlTypeCurrent: [inputObj.motorControlTypeCurrent, [Validators.required,
        control => [0, 1, 2].includes(control.value) ? null : { controlType: true }]],
      motorControlTypeNew: [inputObj.motorControlTypeNew],
      flowMode: [inputObj.flowMode],
      desiredFlowVolume: [inputObj.desiredFlowVolume],
      desiredFlowPercent: [inputObj.desiredFlowPercent],
      diameterFan: [inputObj.diameterFan],
      changeFanSize: [inputObj.changeFanSize, control => typeof control.value === 'boolean' ? null : { selection: true }],
      diameterFanNew: [inputObj.diameterFanNew],
      efficiencyDrive: [inputObj.efficiencyDrive, [...this.numericValidators(), Validators.max(100)]]
    });
    return this.setValidators(form, modificationExists);
  }

  setValidators(form: UntypedFormGroup, modificationExists: boolean = true): UntypedFormGroup {
    if (form.controls.motorControlTypeCurrent.value === 0) {
      form.controls.actualFlow.patchValue(form.controls.ratedFlow.value, { emitEvent: false });
      form.controls.actualFlow.clearValidators();
    } else {
      form.controls.actualFlow.setValidators([...this.numericValidators(), Validators.max(form.controls.ratedFlow.value)]);
    }
    const usesFlow = modificationExists && [1, 2].includes(form.controls.motorControlTypeNew.value);
    const maxFlowVolume: number = this.getMaxDesiredFlowVolume(form);
    form.controls.desiredFlowVolume.clearValidators();
    form.controls.desiredFlowPercent.clearValidators();
    form.controls.flowMode.clearValidators();
    if (usesFlow) {
      form.controls.flowMode.setValidators([Validators.required,
        control => [0, 1].includes(control.value) ? null : { flowMode: true }]);
      if (form.controls.flowMode.value === 1) {
        form.controls.desiredFlowVolume.setValidators([...this.numericValidators(false), Validators.max(maxFlowVolume)]);
      } else {
        const maxFlowPercent: number = maxFlowVolume / form.controls.ratedFlow.value * 100;
        form.controls.desiredFlowPercent.setValidators([...this.numericValidators(false), Validators.max(maxFlowPercent)]);
      }
    }
    if (modificationExists && form.controls.changeFanSize.value) {
      form.controls.diameterFan.setValidators(this.numericValidators());
      form.controls.diameterFanNew.setValidators(this.numericValidators());
    } else {
      form.controls.diameterFan.clearValidators();
      form.controls.diameterFanNew.clearValidators();
    }
    for (const name of ['actualFlow', 'flowMode', 'desiredFlowVolume', 'desiredFlowPercent', 'diameterFan', 'diameterFanNew']) {
      form.controls[name].updateValueAndValidity({ emitEvent: false });
    }
    this.setNoAdjustmentValidator(form, modificationExists);
    return form;
  }

  getMaxDesiredFlowVolume(form: UntypedFormGroup): number {
    const ratedFlow: number = form.controls.ratedFlow.value;
    const current: number = form.controls.diameterFan.value;
    const next: number = form.controls.diameterFanNew.value;
    return form.controls.changeFanSize.value && current > 0 && next > 0
      ? ratedFlow * Math.pow(next / current, 3) : ratedFlow;
  }

  setNoAdjustmentValidator(form: UntypedFormGroup, modificationExists: boolean) {
    const newControl: number = form.controls.motorControlTypeNew.value;
    const noAdjustment: boolean = modificationExists && form.controls.motorControlTypeCurrent.value === 0 &&
      (newControl === 0 || newControl === 3) && !form.controls.changeFanSize.value;
    form.controls.motorControlTypeNew.setValidators(modificationExists ? [Validators.required,
      control => [0, 1, 2, 3].includes(control.value) ? null : { controlType: true },
      () => noAdjustment ? { noAdjustment: true } : null] : []);
    form.controls.motorControlTypeNew.updateValueAndValidity({ emitEvent: false });
  }

  getObjFromForm(form: UntypedFormGroup, modificationExists: boolean = true): FanAffinityLawsInput {
    this.setValidators(form, modificationExists);
    return { ...form.getRawValue() };
  }

  getResults(inputs: FanAffinityLawsInput, settings: Settings, modificationExists: boolean = true): FanAffinityLawsOutput {
    const form: UntypedFormGroup = this.getFormFromObj(inputs, modificationExists);
    if (form.invalid) { return this.emptyResults(); }
    const normalized: FanAffinityLawsInput = this.getObjFromForm(form, modificationExists);
    if (!modificationExists) {
      normalized.changeFanSize = false;
      normalized.motorControlTypeNew = normalized.motorControlTypeCurrent;
      normalized.flowMode = 1;
      normalized.desiredFlowVolume = normalized.actualFlow;
    }
    const converted: FanAffinityLawsInput = this.convertInputs(normalized, settings);
    const results: FanAffinityLawsOutput = converted.changeFanSize
      ? this.fanAffinityLawApiService.changeFanSize(converted, converted.diameterFan, converted.diameterFanNew)
      : this.fanAffinityLawApiService.calculate(converted);
    if (![results.annualEnergyBaseline, results.annualEnergyNew, results.annualCostSavings].every(Number.isFinite)) {
      return this.emptyResults();
    }
    Object.assign(results, this.getIntermediateValues(converted, settings, results));
    if (!modificationExists) {
      results.annualEnergyNew = results.annualEnergyBaseline;
      results.annualCostSavings = 0;
      results.newPower = results.baselinePower;
    }
    return results;
  }

  private emptyResults(): FanAffinityLawsOutput {
    return { annualEnergyBaseline: 0, annualEnergyNew: 0, annualCostSavings: 0 };
  }

  getIntermediateValues(inputs: FanAffinityLawsInput, settings: Settings, results: FanAffinityLawsOutput): Partial<FanAffinityLawsOutput> {
    const baselineFlowPercent: number = this.getBaselineFlowPercent(inputs);
    const ratio: number = inputs.changeFanSize ? inputs.diameterFanNew / inputs.diameterFan : 1;
    const newRatedFlow: number = inputs.ratedFlow * Math.pow(ratio, 3);
    const controlledFlow: boolean = inputs.motorControlTypeNew === 1 || inputs.motorControlTypeNew === 2;
    const desiredVolume: number = controlledFlow
      ? (inputs.flowMode === 1 ? inputs.desiredFlowVolume : inputs.desiredFlowPercent / 100 * inputs.ratedFlow)
      : newRatedFlow;
    const modifiedFraction: number = desiredVolume / newRatedFlow;
    const values: Partial<FanAffinityLawsOutput> = {
      ratedFlow: this.convertFlowForDisplay(inputs.ratedFlow, settings),
      baselineFlowVolume: this.convertFlowForDisplay(inputs.motorControlTypeCurrent === 0 ? inputs.ratedFlow : inputs.actualFlow, settings),
      baselineFlowPercent,
      baselinePower: results.annualEnergyBaseline / inputs.hoursOperation,
      newPower: results.annualEnergyNew / inputs.hoursOperation,
      desiredFlowVolume: this.convertFlowForDisplay(desiredVolume, settings),
      desiredFlowPercent: desiredVolume / inputs.ratedFlow * 100,
      scenario: controlledFlow
        ? (inputs.motorControlTypeNew === 1 ? (inputs.changeFanSize ? 'twoSpeedChangeFanSize' : 'twoSpeed')
          : (inputs.changeFanSize ? 'vsdChangeFanSize' : 'vsd'))
        : (inputs.changeFanSize ? 'changeFanSize' : 'onOff')
    };
    if (inputs.changeFanSize) {
      values.fanDiameterRatio = ratio * 100;
      values.newFanRatedFlow = this.convertFlowForDisplay(newRatedFlow, settings);
      values.newFlowPercent = modifiedFraction * 100;
      if (!controlledFlow) { values.newFlowPercent = ratio * ratio * ratio * 100; }
    }
    if (inputs.motorControlTypeCurrent === 1) {
      const times: FanAffinityLawsTimeFactors = this.fanAffinityLawApiService.get50PercentTimeFactor(baselineFlowPercent / 100);
      values.baselineTimeAbove50Percent = times.timeAbove50Percent * 100;
      values.baselineTimeAt50Percent = times.timeAt50Percent * 100;
      values.baselineTimeAt0Percent = times.timeAt0Percent * 100;
    }
    if (inputs.motorControlTypeNew === 1) {
      const times: FanAffinityLawsTimeFactors = this.fanAffinityLawApiService.get50PercentTimeFactor(modifiedFraction);
      values.timeAbove50Percent = times.timeAbove50Percent * 100;
      values.timeAt50Percent = times.timeAt50Percent * 100;
      values.timeAt0Percent = times.timeAt0Percent * 100;
    }
    return values;
  }

  getBaselineFlowPercent(inputs: FanAffinityLawsInput): number {
    return inputs.motorControlTypeCurrent === 0 ? 100 : inputs.actualFlow / inputs.ratedFlow * 100;
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
      inputs.desiredFlowVolume = this.convertUnitsService.value((inputs.desiredFlowVolume ?? 0)).from('m3/s').to('ft3/min');
      inputs.diameterFan = this.convertUnitsService.value((inputs.diameterFan ?? 0)).from('cm').to('in');
      inputs.diameterFanNew = this.convertUnitsService.value((inputs.diameterFanNew ?? 0)).from('cm').to('in');
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
