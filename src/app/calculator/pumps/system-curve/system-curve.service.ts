import { Injectable } from '@angular/core';
import { PsatService } from '../../../psat/psat.service';
import { PSAT } from '../../../shared/models/psat';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FSAT } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Injectable()
export class SystemCurveService {

  pumpPointOne: { form: FormGroup, fluidPower: number };
  pumpPointTwo: { form: FormGroup, fluidPower: number };
  pumpCurveConstants: { form: FormGroup };
  pumpStaticHead: number;
  pumpLossCoefficient: number;
  // pumpTableData: Array<Array<string>>;
  // pumpKeyColors: Array<{ borderColor: string, fillColor: string }>;
  fanPointOne: { form: FormGroup, fluidPower: number };
  fanPointTwo: { form: FormGroup, fluidPower: number };
  fanCurveConstants: { form: FormGroup };
  fanStaticHead: number;
  fanLossCoefficient: number;
  // fanTableData: Array<Array<string>>;
  // fanKeyColors: Array<{ borderColor: string, fillColor: string }>;
  constructor(private psatService: PsatService, private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  getLossCoefficient(flowRateOne: number, headOne: number, flowRateTwo: number, headTwo: number, lossExponent: number): number {
    //from PSAT/curve.html -> k = (h2-h1)/(Math.pow(f2,C)-Math.pow(f1,C))
    return (headTwo - headOne) / (Math.pow(flowRateTwo, lossExponent) - Math.pow(flowRateOne, lossExponent));
  }

  getStaticHead(flowRateOne: number, headOne: number, flowRateTwo: number, headTwo: number, lossExponent: number): number {
    //from PSAT/curve.html -> hS = h1-(Math.pow(f1,1.9) * (h2-h1) / (Math.pow(f2,C) - Math.pow(f1,C)))
    let tmpStaticHead = headOne - (Math.pow(flowRateOne, lossExponent) * (headTwo - headOne) / (Math.pow(flowRateTwo, lossExponent) - Math.pow(flowRateOne, lossExponent)));
    return this.psatService.roundVal(tmpStaticHead, 2);
  }

  //PUMPS
  getPumpFluidPower(head: number, flow: number, specificGravity: number): number {
    //from Daryl -> fluidPower = (head * flow * specificGravity) / 3960
    return (head * flow * specificGravity) / 3960;
  }

  initPumpPointForm(psat?: PSAT): FormGroup {
    if (psat) {
      return this.formBuilder.group({
        flowRate: [psat.inputs.flow_rate, [Validators.required, Validators.min(0)]],
        head: [psat.inputs.head, [Validators.required, Validators.min(0)]],
        pointAdjustment: [psat.name]
      })
    } else {
      return this.formBuilder.group({
        flowRate: [2000, [Validators.required, Validators.min(0)]],
        head: [276.8, [Validators.required, Validators.min(0)]],
        pointAdjustment: ['']
      })
    }
  }

  initPumpCurveConstants(psat?: PSAT): FormGroup {
    if (psat) {
      return this.formBuilder.group({
        specificGravity: [psat.inputs.specific_gravity, [Validators.required, Validators.min(0)]],
        systemLossExponent: [1.420, [Validators.required, Validators.min(0)]]
      })
    } else {
      return this.formBuilder.group({
        specificGravity: [1.0, [Validators.required, Validators.min(0)]],
        systemLossExponent: [1.000, [Validators.required, Validators.min(0)]]
      })
    }
  }

  //FANS
  //head is really pressure for fans
  getFanFluidPower(pressure: number, flow: number, compressibilityFactor: number): number {
    return (pressure * flow * compressibilityFactor) / 6362;
  }

  //head == pressure = outlet - inlet
  initFanPointForm(fsat?: FSAT): FormGroup {
    if (fsat) {
      return this.formBuilder.group({
        flowRate: [fsat.fieldData.flowRate, [Validators.required, Validators.min(0)]],
        head: [fsat.fieldData.outletPressure - fsat.fieldData.inletPressure, [Validators.required, Validators.min(0)]],
        pointAdjustment: [fsat.name]
      })
    } else {
      return this.formBuilder.group({
        flowRate: [2000, [Validators.required, Validators.min(0)]],
        head: [276.8, [Validators.required, Validators.min(0)]],
        pointAdjustment: ['']
      })
    }
  }

  initFanCurveConstants(fsat?: FSAT): FormGroup {
    if (fsat) {
      return this.formBuilder.group({
        specificGravity: [fsat.fieldData.compressibilityFactor, [Validators.required, Validators.min(0)]],
        systemLossExponent: [1.96969, [Validators.required, Validators.min(0)]]
      })
    } else {
      return this.formBuilder.group({
        specificGravity: [.98, [Validators.required, Validators.min(0)]],
        systemLossExponent: [1.9, [Validators.required, Validators.min(0)]]
      })
    }
  }


  getCurvePointData(settings: Settings, x: any, y: any, increment: number, isFan: boolean, staticHead: number, lossCoefficient: number, curveConstants: { form: FormGroup }): Array<{ x: number, y: number, fluidPower: number }> {
    let powerMeasurement: string;
    if (isFan) {
      powerMeasurement = settings.fanPowerMeasurement;
    }
    else {
      powerMeasurement = settings.powerMeasurement;
    }
    //Load data here
    let data: Array<{ x: number, y: number, fluidPower: number }> = new Array<{ x: number, y: number, fluidPower: number }>();
    var head = staticHead + lossCoefficient * Math.pow(x.domain()[1], curveConstants.form.controls.systemLossExponent.value);

    if (head >= 0) {
      let tmpFluidPower;
      if (isFan) {
        tmpFluidPower = this.getFanFluidPower(staticHead, 0, curveConstants.form.controls.specificGravity.value);
      } else {
        tmpFluidPower = this.getPumpFluidPower(staticHead, 0, curveConstants.form.controls.specificGravity.value);
      }
      if (powerMeasurement != 'hp' && tmpFluidPower != 0) {
        tmpFluidPower = this.convertUnitsService.value(tmpFluidPower).from('hp').to(powerMeasurement);
      }
      data.push({
        x: 0,
        y: staticHead + lossCoefficient * Math.pow(0, curveConstants.form.controls.systemLossExponent.value),
        fluidPower: tmpFluidPower
      });
    }
    else {
      data.push({
        x: 0,
        y: 0,
        fluidPower: 0
      });
    }

    for (var i = 0; i <= x.domain()[1]; i += increment) {
      var head = staticHead + lossCoefficient * Math.pow(i, curveConstants.form.controls.systemLossExponent.value);
      if (head >= 0) {
        let tmpFluidPower: number;
        if (isFan) {
          tmpFluidPower = this.getFanFluidPower(head, i, curveConstants.form.controls.specificGravity.value);
        } else {
          tmpFluidPower = this.getPumpFluidPower(head, i, curveConstants.form.controls.specificGravity.value);
        }
        if (powerMeasurement != 'hp' && tmpFluidPower != 0) {
          tmpFluidPower = this.convertUnitsService.value(tmpFluidPower).from('hp').to(powerMeasurement);
        }
        data.push({
          x: i,
          y: head,
          fluidPower: tmpFluidPower
        });
      }
      else {
        data.push({
          x: i,
          y: 0,
          fluidPower: 0
        });
      }
    }
    head = staticHead + lossCoefficient * Math.pow(x.domain()[1], curveConstants.form.controls.systemLossExponent.value);

    if (head >= 0) {
      let tmpFluidPower: number;
      if (isFan) {
        tmpFluidPower = this.getFanFluidPower(head, x.domain()[1], curveConstants.form.controls.specificGravity.value);
      } else {
        tmpFluidPower = this.getPumpFluidPower(head, x.domain()[1], curveConstants.form.controls.specificGravity.value);;
      }
      if (powerMeasurement != 'hp' && tmpFluidPower != 0) {
        tmpFluidPower = this.convertUnitsService.value(tmpFluidPower).from('hp').to(powerMeasurement);
      }
      data.push({
        x: x.domain()[1],
        y: staticHead + lossCoefficient * Math.pow(x.domain()[1], curveConstants.form.controls.systemLossExponent.value),
        fluidPower: tmpFluidPower
      });
    }
    else {
      data.push({
        x: x.domain()[1],
        y: 0,
        fluidPower: 0
      });
    }
    return data;
  }
}
