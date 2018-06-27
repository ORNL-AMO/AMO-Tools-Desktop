import { Injectable } from '@angular/core';
import { PsatService } from '../../../psat/psat.service';
import { PSAT } from '../../../shared/models/psat';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FSAT } from '../../../shared/models/fans';

@Injectable()
export class SystemCurveService {

  constructor(private psatService: PsatService, private formBuilder: FormBuilder) { }
  
  getLossCoefficient(flowRateOne: number, headOne: number, flowRateTwo: number, headTwo: number, lossExponent: number): number {
    //from PSAT/curve.html -> k = (h2-h1)/(Math.pow(f2,C)-Math.pow(f1,C))
    return (headTwo - headOne) / (Math.pow(flowRateTwo, lossExponent) - Math.pow(flowRateOne, lossExponent));
  }

  getStaticHead(flowRateOne: number, headOne: number, flowRateTwo: number, headTwo: number, lossExponent: number): number {
    //from PSAT/curve.html -> hS = h1-(Math.pow(f1,1.9) * (h2-h1) / (Math.pow(f2,C) - Math.pow(f1,C)))
    let tmpStaticHead = headOne - (Math.pow(flowRateOne, 1.9) * (headTwo - headOne) / (Math.pow(flowRateTwo, lossExponent) - Math.pow(flowRateOne, lossExponent)));
    console.log(tmpStaticHead);
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
        'flowRate': [psat.inputs.flow_rate, Validators.required],
        'head': [psat.inputs.head, Validators.required],
        'pointAdjustment': [psat.name]
      })
    } else {
      return this.formBuilder.group({
        'flowRate': [2000, Validators.required],
        'head': [276.8, Validators.required],
        'pointAdjustment': ['']
      })
    }
  }

  initPumpCurveConstants(psat?: PSAT): FormGroup {
    if (psat) {
      return this.formBuilder.group({
        'specificGravity': [psat.inputs.specific_gravity, Validators.required],
        'systemLossExponent': [1.9, Validators.required]
      })
    } else {
      return this.formBuilder.group({
        'specificGravity': [1.0, Validators.required],
        'systemLossExponent': [1.9, Validators.required]
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
        'flowRate': [fsat.fieldData.flowRate, Validators.required],
        'head': [fsat.fieldData.outletPressure - fsat.fieldData.inletPressure, Validators.required],
        'pointAdjustment': [fsat.name]
      })
    } else {
      return this.formBuilder.group({
        'flowRate': [2000, Validators.required],
        'head': [276.8, Validators.required],
        'pointAdjustment': ['']
      })
    }
  }

  initFanCurveConstants(fsat?: FSAT): FormGroup {
    if (fsat) {
      return this.formBuilder.group({
        'specificGravity': [fsat.fieldData.compressibilityFactor, Validators.required],
        'systemLossExponent': [1.9, Validators.required]
      })
    } else {
      return this.formBuilder.group({
        'specificGravity': [.98, Validators.required],
        'systemLossExponent': [1.9, Validators.required]
      })
    }
  }
}
