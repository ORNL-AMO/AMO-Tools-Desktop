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
    if (!modificationExists) {
      results.annualEnergyNew = results.annualEnergyBaseline;
      results.annualCostSavings = 0;
    }
    return results;
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
