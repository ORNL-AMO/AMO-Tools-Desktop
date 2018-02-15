import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms'
import { PSAT } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PsatService } from '../../../psat/psat.service';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator, CurveData, SystemCurve } from '../../../shared/models/calculators';
import * as _ from 'lodash';
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
  @Input()
  inPsat: boolean;
  @Input()
  assessment: Assessment;
  @Input()
  inAssessment: boolean;
  curveConstants: any;

  pointOne: any;
  pointTwo: any;

  staticHead: number;
  lossCoefficient: number;
  tabSelect: string = 'results';
  calculator: Calculator;
  calcExists: boolean = false;
  showForm: boolean = false;
  saving: boolean = false;
  constructor(private formBuilder: FormBuilder, private indexedDbService: IndexedDbService, private psatService: PsatService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    //in assesssment
    if (this.inAssessment) {
      this.psat.name = 'Baseline';
      this.indexedDbService.getAssessmentCalculator(this.assessment.id).then((results: Array<Calculator>) => {
        if (results.length != 0) {
          this.calculator = results[0];
          this.calcExists = true;
          if (this.calculator.systemCurve) {
            this.initDefault();
            this.setPointValuesFromCalc(true);
            this.curveConstants.form.patchValue({
              specificGravity: this.calculator.systemCurve.specificGravity,
              systemLossExponent: this.calculator.systemCurve.systemLossExponent
            })
            this.showForm = true;
          } else {
            this.initializeCalculator();
            this.initDefault();
            this.setPointValuesFromCalc(true);
            this.curveConstants.form.patchValue({
              specificGravity: this.calculator.systemCurve.specificGravity,
              systemLossExponent: this.calculator.systemCurve.systemLossExponent
            })
            this.showForm = true;
          }
        } else {
          this.initializeCalculator();
          this.initDefault();
          this.setPointValuesFromCalc(true);
          this.curveConstants.form.patchValue({
            specificGravity: this.calculator.systemCurve.specificGravity,
            systemLossExponent: this.calculator.systemCurve.systemLossExponent
          })
          this.showForm = true;
        }
      })
    }
    //stand alone
    else {
      this.initDefault();
      //get system settings if using stand alone calculator
      if (!this.settings) {
        this.indexedDbService.getDirectorySettings(1).then(
          results => {
            this.settings = results[0];
            this.convertDefaults(this.settings);
            this.showForm = true;
          }
        )
      } else {
        this.showForm = true;
      }
    }
  }

  setPointValuesFromCalc(init?: boolean) {
    if (this.pointOne && !init) {
      this.calculator.systemCurve.selectedP1Name = this.pointOne.form.controls.pointAdjustment.value;
    }
    if (this.pointTwo && !init) {
      this.calculator.systemCurve.selectedP2Name = this.pointTwo.form.controls.pointAdjustment.value;
    }
    let p1 = _.find(this.calculator.systemCurve.dataPoints, (point: CurveData) => { return point.modName == this.calculator.systemCurve.selectedP1Name });
    this.pointOne.form.patchValue({
      flowRate: p1.flowRate,
      head: p1.head,
      pointAdjustment: p1.modName
    })
    let p2 = _.find(this.calculator.systemCurve.dataPoints, (point: CurveData) => { return point.modName == this.calculator.systemCurve.selectedP2Name });
    this.pointTwo.form.patchValue({
      flowRate: p2.flowRate,
      head: p2.head,
      pointAdjustment: p2.modName
    })
    this.calculateP1Flow();
    this.calculateP2Flow();
    this.calculateValues();
  }

  changes() {
    if (this.inAssessment) {
      this.saveCalculator();
    } else {
      this.calculateP1Flow();
      this.calculateP2Flow();
      this.calculateValues();
    }
  }

  convertDefaults(settings: Settings) {
    if (settings.flowMeasurement != 'gpm') {
      let tmpVal = this.convertUnitsService.value(this.pointOne.form.controls.flowRate.value).from('gpm').to(settings.flowMeasurement);
      //let tmpVal2 = this.convertUnitsService.value(this.pointTwo.form.controls.flowRate.value).from('gpm').to(results[0].flowMeasurement);
      this.pointOne.form.patchValue({
        flowRate: this.psatService.roundVal(tmpVal, 2)
      })
      // this.pointTwo.form.patchValue({
      //   flowRate: this.psatService.roundVal(tmpVal2, 2)
      // })
    }
    if (settings.distanceMeasurement != 'ft') {
      let tmpVal = this.convertUnitsService.value(this.pointOne.form.controls.head.value).from('ft').to(settings.distanceMeasurement);
      let tmpVal2 = this.convertUnitsService.value(this.pointTwo.form.controls.head.value).from('ft').to(settings.distanceMeasurement);
      this.pointOne.form.patchValue({
        head: this.psatService.roundVal(tmpVal, 2)
      })
      this.pointTwo.form.patchValue({
        head: this.psatService.roundVal(tmpVal2, 2)
      })
    }
  }

  initInPsat() {
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
  }

  initDefault() {
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
  }

  initPointForm(psat?: PSAT) {
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

  initCurveConstants(psat?: PSAT) {
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

  initializeCalculator(reset?: boolean) {
    let id
    if (this.calculator) {
      id = this.calculator.id;
    }
    let dataPoints = new Array<CurveData>();
    let baselinePoint: CurveData = {
      modName: this.psat.name,
      flowRate: this.psat.inputs.flow_rate,
      head: this.psat.inputs.head
    }
    dataPoints.push(baselinePoint)
    this.psat.modifications.forEach(mod => {
      let modPoint: CurveData = {
        modName: mod.psat.name,
        flowRate: mod.psat.inputs.flow_rate,
        head: mod.psat.inputs.head
      }
      dataPoints.push(modPoint);
    })
    let systemCurve: SystemCurve = {
      specificGravity: this.psat.inputs.specific_gravity,
      systemLossExponent: 1.9,
      dataPoints: dataPoints,
      selectedP1Name: dataPoints[0].modName,
      selectedP2Name: dataPoints[1].modName
    }
    if (this.calculator) {
      this.calculator.systemCurve = systemCurve;
    } else {
      this.calculator = {
        assessmentId: this.assessment.id,
        systemCurve: systemCurve
      }
    }
    if (reset) {
      this.setPointValuesFromCalc(true)
      this.saveCalculator();
    }
  }

  saveCalculator() {
    this.calculator.systemCurve.specificGravity = this.curveConstants.form.controls.specificGravity.value;
    this.calculator.systemCurve.systemLossExponent = this.curveConstants.form.controls.systemLossExponent.value;
    this.calculator.systemCurve.selectedP1Name = this.pointOne.form.controls.pointAdjustment.value;
    this.calculator.systemCurve.selectedP2Name = this.pointTwo.form.controls.pointAdjustment.value;
    _.find(this.calculator.systemCurve.dataPoints, (point: CurveData) => { return point.modName == this.calculator.systemCurve.selectedP1Name }).flowRate = this.pointOne.form.controls.flowRate.value;
    _.find(this.calculator.systemCurve.dataPoints, (point: CurveData) => { return point.modName == this.calculator.systemCurve.selectedP1Name }).head = this.pointOne.form.controls.head.value;
    _.find(this.calculator.systemCurve.dataPoints, (point: CurveData) => { return point.modName == this.calculator.systemCurve.selectedP2Name }).flowRate = this.pointTwo.form.controls.flowRate.value;
    _.find(this.calculator.systemCurve.dataPoints, (point: CurveData) => { return point.modName == this.calculator.systemCurve.selectedP2Name }).head = this.pointTwo.form.controls.head.value;
    if (!this.saving || this.calcExists) {
      if (this.calcExists) {
        this.indexedDbService.putCalculator(this.calculator);
      } else {
        this.saving = true;
        this.calculator.assessmentId = this.assessment.id;
        this.indexedDbService.addCalculator(this.calculator).then((result) => { 
          this.calculator.id = result; 
          this.calcExists = true; 
          this.saving = false;
        });
      }
    }
    this.calculateP1Flow();
    this.calculateP2Flow();
    this.calculateValues();
  }


  //calculations
  calculateP1Flow() {
    if (this.pointOne.form.status == 'VALID') {
      this.pointOne.fluidPower = this.getFluidPower(this.pointOne.form.controls.head.value, this.pointOne.form.controls.flowRate.value, this.curveConstants.form.controls.specificGravity.value);
    }
  }

  calculateP2Flow() {
    if (this.pointTwo.form.status == 'VALID') {
      this.pointTwo.fluidPower = this.getFluidPower(this.pointTwo.form.controls.head.value, this.pointTwo.form.controls.flowRate.value, this.curveConstants.form.controls.specificGravity.value);
    }
  }


  calculateValues() {
    if (this.pointOne.form.status == 'VALID' && this.pointTwo.form.status == 'VALID' && this.curveConstants.form.status == 'VALID') {
      this.lossCoefficient = this.getLossCoefficient(
        this.pointOne.form.controls.flowRate.value,
        this.pointOne.form.controls.head.value,
        this.pointTwo.form.controls.flowRate.value,
        this.pointTwo.form.controls.head.value,
        this.curveConstants.form.controls.systemLossExponent.value
      );
      this.staticHead = this.getStaticHead(
        this.pointOne.form.controls.flowRate.value,
        this.pointOne.form.controls.head.value,
        this.pointTwo.form.controls.flowRate.value,
        this.pointTwo.form.controls.head.value,
        this.curveConstants.form.controls.systemLossExponent.value
      );
    }
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
    let tmpStaticHead = headOne - (Math.pow(flowRateOne, 1.9) * (headTwo - headOne) / (Math.pow(flowRateTwo, lossExponent) - Math.pow(flowRateOne, lossExponent)));
    return this.psatService.roundVal(tmpStaticHead, 2);
  }
  setTab(str: string) {
    this.tabSelect = str;
  }


}
