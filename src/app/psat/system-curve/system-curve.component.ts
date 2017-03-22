import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms'
@Component({
  selector: 'app-system-curve',
  templateUrl: './system-curve.component.html',
  styleUrls: ['./system-curve.component.css']
})
export class SystemCurveComponent implements OnInit {

  curveConstants: any;

  pointOne: any;
  pointTwo: any;

  staticHead: number;
  lossCoefficient: number;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
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
  }

  initPointForm() {
    return this.formBuilder.group({
      'flowRate': ['', Validators.required],
      'head': ['', Validators.required],
      'pointAdjustment': ['', Validators.required]
    })
  }

  initCurveConstants() {
    return this.formBuilder.group({
      'specificGravity': ['', Validators.required],
      'systemLossExponent': ['', Validators.required]
    })
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


  getLossCoefficient(flowRateOne: number, headOne: number, flowRateTwo: number, headTwo: number, lossExponent: number): number {
    //from PSAT/curve.html -> k = (h2-h1)/(Math.pow(f2,C)-Math.pow(f1,C))
    return (headTwo - headOne) / (Math.pow(flowRateTwo, lossExponent) - Math.pow(flowRateOne, lossExponent));
  }

  getStaticHead(flowRateOne: number, headOne: number, flowRateTwo: number, headTwo: number, lossExponent: number): number {
    //from PSAT/curve.html -> hS = h1-(Math.pow(f1,1.9) * (h2-h1) / (Math.pow(f2,C) - Math.pow(f1,C)))
    return headOne - (Math.pow(flowRateOne, 1.9) * (headTwo - headOne) / (Math.pow(flowRateTwo, lossExponent) - Math.pow(flowRateOne, lossExponent)))
  }

}
