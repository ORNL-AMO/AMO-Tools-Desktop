import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms'
import { PSAT } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';

@Component({
  selector: 'app-system-curve',
  templateUrl: './system-curve.component.html',
  styleUrls: ['./system-curve.component.css']
})
export class SystemCurveComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;

  curveConstants: any;

  pointOne: any;
  pointTwo: any;

  staticHead: number;
  lossCoefficient: number;

  constructor(private formBuilder: FormBuilder, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    if (this.psat) {
      this.psat.name = 'Baseline';
      this.curveConstants = {
        form: this.initCurveConstants(this.psat)
      };
      this.pointOne = {
        form: this.initPointForm(this.psat),
        fluidPower: 0
      };
      this.pointTwo = {
        form: this.initPointForm(),
        fluidPower: 0
      };
      this.pointTwo.form.patchValue({
        flowRate: '',
        head: ''
      })
      this.pointTwo.form.value.pointAdjustment = 'Baseline';
    } else {
      this.curveConstants = {
        form: this.initCurveConstants()
      };
      this.pointOne = {
        form: this.initPointForm(),
        fluidPower: 0
      };
      this.pointTwo = {
        form: this.initPointForm(),
        fluidPower: 0
      };
      this.pointTwo.form.patchValue({
        flowRate: 0,
        head: 200
      })
      this.pointOne.form.value.pointAdjustment = 'Point One';
      this.pointTwo.form.value.pointAdjustment = 'Point Two';
    }

    //get systen settings if using stand alone calculator
    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(
        results => {
          this.settings = results[0];
        }
      )
    }
  }

  initPointForm(psat?: PSAT) {
    if (psat) {
      return this.formBuilder.group({
        'flowRate': [psat.inputs.flow_rate, Validators.required],
        'head': [psat.inputs.head, Validators.required],
        'pointAdjustment': [psat.name, Validators.required]
      })
    } else {
      return this.formBuilder.group({
        'flowRate': [2000, Validators.required],
        'head': [276.8, Validators.required],
        'pointAdjustment': ['', Validators.required]
      })
    }
  }

  initCurveConstants(psat?: PSAT) {
    if (psat) {
      return this.formBuilder.group({
        'specificGravity': [psat.inputs.specific_gravity, Validators.required],
        'systemLossExponent': [2.5, Validators.required]
      })
    } else {
      return this.formBuilder.group({
        'specificGravity': [1.0, Validators.required],
        'systemLossExponent': [1.9, Validators.required]
      })
    }
  }

  calculateP1Flow() {
    this.pointOne.fluidPower = this.getFluidPower(this.pointOne.form.value.head, this.pointOne.form.value.flowRate, this.curveConstants.form.value.specificGravity);
  }

  calculateP2Flow() {
    this.pointTwo.fluidPower = this.getFluidPower(this.pointTwo.form.value.head, this.pointTwo.form.value.flowRate, this.curveConstants.form.value.specificGravity);
  }


  calculateValues() {
    this.lossCoefficient = this.getLossCoefficient(
      this.pointOne.form.value.flowRate,
      this.pointOne.form.value.head,
      this.pointTwo.form.value.flowRate,
      this.pointTwo.form.value.head,
      this.curveConstants.form.value.systemLossExponent
    );
    this.staticHead = this.getStaticHead(
      this.pointOne.form.value.flowRate,
      this.pointOne.form.value.head,
      this.pointTwo.form.value.flowRate,
      this.pointTwo.form.value.head,
      this.curveConstants.form.value.systemLossExponent
    );
  }

  getFluidPower(head: number, flow: number, specificGravity: number): number {
    //from Daryl -> fluidPower = (head * flow * specificGravity) / 3960
    return (head * flow * specificGravity) / 3960;
  }


  getLossCoefficient(flowRateOne: number, headOne: number, flowRateTwo: number, headTwo: number, lossExponent: number): number {
    //from PSAT/curve.html -> k = (h2-h1)/(Math.pow(f2,C)-Math.pow(f1,C))
    return (headTwo - headOne) / (Math.pow(flowRateTwo, lossExponent) - Math.pow(flowRateOne, lossExponent));
  }

  getStaticHead(flowRateOne: number, headOne: number, flowRateTwo: number, headTwo: number, lossExponent: number): number {
    //from PSAT/curve.html -> hS = h1-(Math.pow(f1,1.9) * (h2-h1) / (Math.pow(f2,C) - Math.pow(f1,C)))
    return headOne - (Math.pow(flowRateOne, 1.9) * (headTwo - headOne) / (Math.pow(flowRateTwo, lossExponent) - Math.pow(flowRateOne, lossExponent)))
  }

}
