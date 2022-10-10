import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FlowCalculations } from '../../../shared/models/phast/flowCalculations';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Injectable()
export class EnergyUseService {

  flowCalculations: FlowCalculations = {
    //natural gas
    gasType: 0,
    specificGravity: 0.657,
    orificeDiameter: 3.5,
    insidePipeDiameter: 8,
    // 1 is sharp edge
    sectionType: 1,
    dischargeCoefficient: 0.6,
    gasHeatingValue: 1032.44,
    gasTemperature: 85,
    gasPressure: 85,
    orificePressureDrop: 10,
    operatingTime: 10
  };

  constructor(private convertUnitsService: ConvertUnitsService, private formBuilder: UntypedFormBuilder) { }

  getFormFromObj(inputObj: FlowCalculations): UntypedFormGroup {
    let tmpForm = this.formBuilder.group({
      gasType: [inputObj.gasType],
      specificGravity: [inputObj.specificGravity, [Validators.required]],
      orificeDiameter: [inputObj.orificeDiameter, [Validators.required, Validators.min(0)]],
      insidePipeDiameter: [inputObj.insidePipeDiameter, [Validators.required, Validators.min(0)]],
      sectionType: [inputObj.sectionType],
      dischargeCoefficient: [inputObj.dischargeCoefficient, [Validators.required]],
      gasHeatingValue: [inputObj.gasHeatingValue, [Validators.required]],
      gasTemperature: [inputObj.gasTemperature, [Validators.required]],
      gasPressure: [inputObj.gasPressure, [Validators.required]],
      orificePressureDrop: [inputObj.orificePressureDrop, [Validators.required]],
      operatingTime: [inputObj.operatingTime, [Validators.required, Validators.min(0)]],
    });
    return tmpForm;
  }

  getObjFromForm(form: UntypedFormGroup): FlowCalculations {
    this.flowCalculations = {
      gasType: form.controls.gasType.value,
      specificGravity: form.controls.specificGravity.value,
      orificeDiameter: form.controls.orificeDiameter.value,
      insidePipeDiameter: form.controls.insidePipeDiameter.value,
      sectionType: form.controls.sectionType.value,
      dischargeCoefficient: form.controls.dischargeCoefficient.value,
      gasHeatingValue: form.controls.gasHeatingValue.value,
      gasTemperature: form.controls.gasTemperature.value,
      gasPressure: form.controls.gasPressure.value,
      orificePressureDrop: form.controls.orificePressureDrop.value,
      operatingTime: form.controls.operatingTime.value,
    };
    return this.flowCalculations;
  }

  generateExample(settings: Settings) {
    if (settings.unitsOfMeasure === 'Metric') {
      return this.flowCalculations = {
        //natural gas
        gasType: 0,
        specificGravity: 0.657,
        orificeDiameter: this.convertUnitsService.roundVal(this.convertUnitsService.value(3.5).from('in').to('cm'), 2),
        insidePipeDiameter: this.convertUnitsService.roundVal(this.convertUnitsService.value(8).from('in').to('cm'), 2),
        // 1 is sharp edge
        sectionType: 1,
        dischargeCoefficient: 0.6,
        gasHeatingValue: this.convertUnitsService.roundVal(this.convertUnitsService.value(this.flowCalculations.gasHeatingValue).from('btuSCF').to('kJNm3'), 2),
        gasTemperature: this.convertUnitsService.roundVal(this.convertUnitsService.value(85).from('F').to('C'), 2),
        gasPressure: this.convertUnitsService.roundVal(this.convertUnitsService.value(85).from('psi').to('kPa'), 2),
        orificePressureDrop: this.convertUnitsService.roundVal(this.convertUnitsService.value(10).from('in').to('cm'), 2),
        operatingTime: 10
      };
    } else {
      return this.flowCalculations = {
        //natural gas
        gasType: 0,
        specificGravity: 0.657,
        orificeDiameter: 3.5,
        insidePipeDiameter: 8,
        // 1 is sharp edge
        sectionType: 1,
        dischargeCoefficient: 0.6,
        gasHeatingValue: 1032.44,
        gasTemperature: 85,
        gasPressure: 85,
        orificePressureDrop: 10,
        operatingTime: 10
      };
    }
  }

  getResetData() {
    return this.flowCalculations = {
      //natural gas
      gasType: 0,
      specificGravity: 0,
      orificeDiameter: 0,
      insidePipeDiameter: 0,
      // 1 is sharp edge
      sectionType: 0,
      dischargeCoefficient: 0,
      gasHeatingValue: 0,
      gasTemperature: 0,
      gasPressure: 0,
      orificePressureDrop: 0,
      operatingTime: 0
    }
  }
}
