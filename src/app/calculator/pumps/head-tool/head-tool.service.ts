import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { HeadToolSuction, HeadTool } from '../../../shared/models/calculators';

@Injectable()
export class HeadToolService {

  headToolInputs: HeadTool;
  headToolSuctionInputs: HeadToolSuction;
  headToolType: string;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  getExampleHeadToolSuctionForm(settings: Settings) {
    let smallUnit, pressureUnit;
    if (settings.distanceMeasurement === 'ft') {
      smallUnit = 'in';
    } else {
      smallUnit = 'mm';
    }
    return this.formBuilder.group({
      suctionPipeDiameter: [this.roundVal(this.convertUnitsService.value(12).from('in').to(smallUnit), 2), [Validators.required, Validators.min(0)]],
      suctionTankGasOverPressure: [0, Validators.required],
      suctionTankFluidSurfaceElevation: [this.roundVal(this.convertUnitsService.value(10).from('ft').to(settings.distanceMeasurement), 2), Validators.required],
      suctionLineLossCoefficients: [.5, Validators.required],
      dischargePipeDiameter: [this.roundVal(this.convertUnitsService.value(12).from('in').to(smallUnit), 2), [Validators.required, Validators.min(0)]],
      dischargeGaugePressure: [this.roundVal(this.convertUnitsService.value(124).from('psi').to(settings.pressureMeasurement), 2), Validators.required],
      dischargeGaugeElevation: [this.roundVal(this.convertUnitsService.value(10).from('ft').to(settings.distanceMeasurement), 2), Validators.required],
      dischargeLineLossCoefficients: [1, Validators.required],
      specificGravity: [1, [Validators.required, Validators.min(0)]],
      flowRate: [this.roundVal(this.convertUnitsService.value(2000).from('gpm').to(settings.flowMeasurement), 2), [Validators.required, Validators.min(0)]],
    });
  }

  initHeadToolSuctionForm(settings: Settings) {
    let smallUnit, pressureUnit;
    if (settings.distanceMeasurement === 'ft') {
      smallUnit = 'in';
    } else {
      smallUnit = 'mm';
    }
    return this.formBuilder.group({
      suctionPipeDiameter: [this.roundVal(this.convertUnitsService.value(0).from('in').to(smallUnit), 2), [Validators.required, Validators.min(0)]],
      suctionTankGasOverPressure: [0, Validators.required],
      suctionTankFluidSurfaceElevation: [this.roundVal(this.convertUnitsService.value(0).from('ft').to(settings.distanceMeasurement), 2), Validators.required],
      suctionLineLossCoefficients: [0, Validators.required],
      dischargePipeDiameter: [this.roundVal(this.convertUnitsService.value(0).from('in').to(smallUnit), 2), [Validators.required, Validators.min(0)]],
      dischargeGaugePressure: [this.roundVal(this.convertUnitsService.value(0).from('psi').to(settings.pressureMeasurement), 2), Validators.required],
      dischargeGaugeElevation: [this.roundVal(this.convertUnitsService.value(0).from('ft').to(settings.distanceMeasurement), 2), Validators.required],
      dischargeLineLossCoefficients: [0, Validators.required],
      specificGravity: [1, [Validators.required, Validators.min(0)]],
      flowRate: [this.roundVal(this.convertUnitsService.value(0).from('gpm').to(settings.flowMeasurement), 2), [Validators.required, Validators.min(0)]],
    });
  }

  getExampleHeadToolForm(settings: Settings) {
    let smallUnit;
    if (settings.distanceMeasurement === 'ft') {
      smallUnit = 'in';
    } else {
      smallUnit = 'mm';
    }
    return this.formBuilder.group({
      suctionPipeDiameter: [this.roundVal(this.convertUnitsService.value(12).from('in').to(smallUnit), 2), [Validators.required, Validators.min(0)]],
      suctionGuagePressure: [this.roundVal(this.convertUnitsService.value(5).from('psi').to(settings.pressureMeasurement), 2), Validators.required],
      suctionGuageElevation: [this.roundVal(this.convertUnitsService.value(10).from('ft').to(settings.distanceMeasurement), 2), Validators.required],
      suctionLineLossCoefficients: [.5, Validators.required],
      dischargePipeDiameter: [this.roundVal(this.convertUnitsService.value(12).from('in').to(smallUnit), 2), [Validators.required, Validators.min(0)]],
      dischargeGaugePressure: [this.roundVal(this.convertUnitsService.value(124).from('psi').to(settings.pressureMeasurement), 2), Validators.required],
      dischargeGaugeElevation: [this.roundVal(this.convertUnitsService.value(10).from('ft').to(settings.distanceMeasurement), 2), Validators.required],
      dischargeLineLossCoefficients: [1, Validators.required],
      specificGravity: [1, [Validators.required, Validators.min(0)]],
      flowRate: [this.roundVal(this.convertUnitsService.value(2000).from('gpm').to(settings.flowMeasurement), 2), [Validators.required, Validators.min(0)]],
    });
  }

  initHeadToolForm(settings: Settings) {
    let smallUnit;
    if (settings.distanceMeasurement === 'ft') {
      smallUnit = 'in';
    } else {
      smallUnit = 'mm';
    }
    return this.formBuilder.group({
      suctionPipeDiameter: [this.roundVal(this.convertUnitsService.value(0).from('in').to(smallUnit), 2), [Validators.required, Validators.min(0)]],
      suctionGuagePressure: [this.roundVal(this.convertUnitsService.value(0).from('psi').to(settings.pressureMeasurement), 2), Validators.required],
      suctionGuageElevation: [this.roundVal(this.convertUnitsService.value(0).from('ft').to(settings.distanceMeasurement), 2), Validators.required],
      suctionLineLossCoefficients: [0, Validators.required],
      dischargePipeDiameter: [this.roundVal(this.convertUnitsService.value(0).from('in').to(smallUnit), 2), [Validators.required, Validators.min(0)]],
      dischargeGaugePressure: [this.roundVal(this.convertUnitsService.value(0).from('psi').to(settings.pressureMeasurement), 2), Validators.required],
      dischargeGaugeElevation: [this.roundVal(this.convertUnitsService.value(0).from('ft').to(settings.distanceMeasurement), 2), Validators.required],
      dischargeLineLossCoefficients: [0, Validators.required],
      specificGravity: [1, [Validators.required, Validators.min(0)]],
      flowRate: [this.roundVal(this.convertUnitsService.value(0).from('gpm').to(settings.flowMeasurement), 2), [Validators.required, Validators.min(0)]],
    });
  }


  getHeadToolFormFromObj(headTool: HeadTool) {
    return this.formBuilder.group({
      suctionPipeDiameter: [headTool.suctionPipeDiameter, [Validators.required, Validators.min(0)]],
      suctionGuagePressure: [headTool.suctionGaugePressure, Validators.required],
      suctionGuageElevation: [headTool.suctionGaugeElevation, Validators.required],
      suctionLineLossCoefficients: [headTool.suctionLineLossCoefficients, Validators.required],
      dischargePipeDiameter: [headTool.dischargePipeDiameter, [Validators.required, Validators.min(0)]],
      dischargeGaugePressure: [headTool.dischargeGaugePressure, Validators.required],
      dischargeGaugeElevation: [headTool.dischargeGaugeElevation, Validators.required],
      dischargeLineLossCoefficients: [headTool.dischargeLineLossCoefficients, Validators.required],
      specificGravity: [headTool.specificGravity, [Validators.required, Validators.min(0)]],
      flowRate: [headTool.flowRate, [Validators.required, Validators.min(0)]],
    });
  }

  getHeadToolSuctionFormFromObj(headToolSuction: HeadToolSuction): FormGroup {
    return this.formBuilder.group({
      suctionPipeDiameter: [headToolSuction.suctionPipeDiameter, [Validators.required, Validators.min(0)]],
      suctionTankGasOverPressure: [headToolSuction.suctionTankGasOverPressure, Validators.required],
      suctionTankFluidSurfaceElevation: [headToolSuction.suctionTankFluidSurfaceElevation, Validators.required],
      suctionLineLossCoefficients: [headToolSuction.suctionLineLossCoefficients, Validators.required],
      dischargePipeDiameter: [headToolSuction.dischargePipeDiameter, [Validators.required, Validators.min(0)]],
      dischargeGaugePressure: [headToolSuction.dischargeGaugePressure, Validators.required],
      dischargeGaugeElevation: [headToolSuction.dischargeGaugeElevation, Validators.required],
      dischargeLineLossCoefficients: [headToolSuction.dischargeLineLossCoefficients, Validators.required],
      specificGravity: [headToolSuction.specificGravity, [Validators.required, Validators.min(0)]],
      flowRate: [headToolSuction.flowRate, [Validators.required, Validators.min(0)]],
    });
  }

  getHeadToolFromForm(form: FormGroup): HeadTool {
    let headTool: HeadTool = {
      specificGravity: form.controls.specificGravity.value,
      flowRate: form.controls.flowRate.value,
      suctionPipeDiameter: form.controls.suctionPipeDiameter.value,
      suctionGaugePressure: form.controls.suctionGuagePressure.value,
      suctionGaugeElevation: form.controls.suctionGuageElevation.value,
      suctionLineLossCoefficients: form.controls.suctionLineLossCoefficients.value,
      dischargePipeDiameter: form.controls.dischargePipeDiameter.value,
      dischargeGaugePressure: form.controls.dischargeGaugePressure.value,
      dischargeGaugeElevation: form.controls.dischargeGaugeElevation.value,
      dischargeLineLossCoefficients: form.controls.dischargeLineLossCoefficients.value,
    };
    return headTool;
  }

  getHeadToolSuctionFromForm(form: FormGroup): HeadToolSuction {
    let headToolSuction: HeadToolSuction = {
      specificGravity: form.controls.specificGravity.value,
      flowRate: form.controls.flowRate.value,
      suctionPipeDiameter: form.controls.suctionPipeDiameter.value,
      suctionTankGasOverPressure: form.controls.suctionTankGasOverPressure.value,
      suctionTankFluidSurfaceElevation: form.controls.suctionTankFluidSurfaceElevation.value,
      suctionLineLossCoefficients: form.controls.suctionLineLossCoefficients.value,
      dischargePipeDiameter: form.controls.dischargePipeDiameter.value,
      dischargeGaugePressure: form.controls.dischargeGaugePressure.value,
      dischargeGaugeElevation: form.controls.dischargeGaugeElevation.value,
      dischargeLineLossCoefficients: form.controls.dischargeLineLossCoefficients.value,
    };
    return headToolSuction;
  }

  roundVal(val: number, digits: number) {
    return Number(val.toFixed(digits));
  }
}
