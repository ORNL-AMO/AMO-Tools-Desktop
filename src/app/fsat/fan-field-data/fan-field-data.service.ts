import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { CompressibilityFactor, FieldData, FsatOutput } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';
import { GreaterThanValidator } from '../../shared/validators/greater-than';
import { FansSuiteApiService } from '../../tools-suite-api/fans-suite-api.service';


@Injectable()
export class FanFieldDataService {

  constructor(private fansSuiteApiService: FansSuiteApiService,
  private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService) { }


  getFormFromObj(obj: FieldData): UntypedFormGroup {
    let userDefinedVelocityPressure: boolean = true;
    if(obj.userDefinedVelocityPressure != undefined){
      userDefinedVelocityPressure = obj.userDefinedVelocityPressure;
    }

    let form: UntypedFormGroup = this.formBuilder.group({
      flowRate: [obj.flowRate, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      inletPressure: [obj.inletPressure, [Validators.required]],
      ductArea: [obj.ductArea],
      inletVelocityPressure: [obj.inletVelocityPressure, [Validators.required]],
      usingStaticPressure: [obj.usingStaticPressure],
      outletPressure: [obj.outletPressure, [Validators.required]],
      loadEstimatedMethod: [obj.loadEstimatedMethod, Validators.required],
      motorPower: [obj.motorPower, Validators.required],
      compressibilityFactor: [obj.compressibilityFactor, [Validators.required, Validators.min(0)]],
      measuredVoltage: [obj.measuredVoltage, Validators.required],
      userDefinedCompressibilityFactor: [obj.userDefinedCompressibilityFactor],
      userDefinedVelocityPressure: [userDefinedVelocityPressure]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getObjFromForm(form: UntypedFormGroup): FieldData {
    let newData: FieldData = {
      flowRate: form.controls.flowRate.value,
      inletPressure: form.controls.inletPressure.value,
      ductArea: form.controls.ductArea.value,
      inletVelocityPressure: form.controls.inletVelocityPressure.value,
      outletPressure: form.controls.outletPressure.value,
      loadEstimatedMethod: form.controls.loadEstimatedMethod.value,
      usingStaticPressure: form.controls.usingStaticPressure.value,
      motorPower: form.controls.motorPower.value,
      compressibilityFactor: form.controls.compressibilityFactor.value,
      measuredVoltage: form.controls.measuredVoltage.value,
      userDefinedCompressibilityFactor: form.controls.userDefinedCompressibilityFactor.value,
      userDefinedVelocityPressure: form.controls.userDefinedVelocityPressure.value
    };
    return newData;
  }

  isFanFieldDataValid(obj: FieldData): boolean {
    let form: UntypedFormGroup = this.getFormFromObj(obj);
    return form.valid;
  }

  compressibilityFactor(inputs: CompressibilityFactor, settings: Settings) {
    let inputCpy: CompressibilityFactor = JSON.parse(JSON.stringify(inputs));
    inputCpy.flowRate = this.convertUnitsService.value(inputCpy.flowRate).from(settings.fanFlowRate).to('ft3/min');
    inputCpy.inletPressure = this.convertUnitsService.value(inputCpy.inletPressure).from(settings.fanPressureMeasurement).to('inH2o');
    inputCpy.outletPressure = this.convertUnitsService.value(inputCpy.outletPressure).from(settings.fanPressureMeasurement).to('inH2o');
    inputCpy.barometricPressure = this.convertUnitsService.value(inputCpy.barometricPressure).from(settings.fanBarometricPressure).to('inHg');
    inputCpy.moverShaftPower = this.convertUnitsService.value(inputCpy.moverShaftPower).from(settings.fanPowerMeasurement).to('hp');
    return this.fansSuiteApiService.compressibilityFactor(inputCpy);
  }

  calculateCompressibilityFactor(compressibilityFactorInput: CompressibilityFactor, isBaseline: boolean, fsatOutput: FsatOutput, settings: Settings) {
    let compressibilityFactor: number;
    if (isBaseline) {
      compressibilityFactor = this.compressibilityFactor(compressibilityFactorInput, settings);
    } else {
      let currentMoverShaftPower;
      let diff = 1;

      while (diff > .001) {
        let fanEff = fsatOutput.fanEfficiency;
        // If not first iteration, calculate with moverShaftPower (tempShaftPower from the previous iteration)
        if (currentMoverShaftPower) {
          compressibilityFactorInput.moverShaftPower = currentMoverShaftPower
        }
        compressibilityFactor = this.compressibilityFactor(compressibilityFactorInput, settings);
        let tempShaftPower = compressibilityFactorInput.flowRate * (compressibilityFactorInput.outletPressure - compressibilityFactorInput.inletPressure) * compressibilityFactor / (6362 * (fanEff / 100));

        diff = Math.abs(compressibilityFactorInput.moverShaftPower - tempShaftPower);
        currentMoverShaftPower = tempShaftPower;
      }
    }

    if (isNaN(compressibilityFactor)) {
      compressibilityFactor = null;
    } else {
      compressibilityFactor = Number(compressibilityFactor.toFixed(3))
    }
    return compressibilityFactor;
  }

  
}
