import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms'
import { PSAT } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PsatService } from '../../../psat/psat.service';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator, CurveData, SystemCurve } from '../../../shared/models/calculators';
import * as _ from 'lodash';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { FSAT } from '../../../shared/models/fans';
import { SystemCurveService } from './system-curve.service';
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
  assessment: Assessment;
  @Input()
  inAssessment: boolean;
  @Input()
  isFan: boolean;
  @Input()
  fsat: FSAT;

  curveConstants: { form: FormGroup };

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  pointOne: { form: FormGroup, fluidPower: number };
  pointTwo: { form: FormGroup, fluidPower: number };;

  staticHead: number;
  lossCoefficient: number;
  tabSelect: string = 'results';
  calculator: Calculator;
  calcExists: boolean = false;
  showForm: boolean = false;
  saving: boolean = false;
  constructor(private systemCurveService: SystemCurveService, private settingsDbService: SettingsDbService, private calculatorDbService: CalculatorDbService, private indexedDbService: IndexedDbService, private psatService: PsatService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    //in assesssment
    if (this.inAssessment) {
      if (this.isFan) {
        this.fsat.name = 'Baseline';
      } else {
        this.psat.name = 'Baseline';
      }
      this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
      if (this.calculator) {
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
    }
    //stand alone
    else {
      this.initDefault();
      //get system settings if using stand alone calculator
      if (!this.settings) {
        this.settings = this.settingsDbService.globalSettings;
        if (!this.isFan) {
          this.convertPumpDefaults(this.settings);
        } else {
          this.convertFanDefaults(this.settings);
        }
        this.showForm = true;
      } else {
        this.showForm = true;
      }
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
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

  convertPumpDefaults(settings: Settings) {
    if (settings.flowMeasurement != 'gpm') {
      let tmpVal = this.convertUnitsService.value(this.pointOne.form.controls.flowRate.value).from('gpm').to(settings.flowMeasurement);
      this.pointOne.form.patchValue({
        flowRate: this.psatService.roundVal(tmpVal, 2)
      })
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

  convertFanDefaults(settings: Settings) {
    if (settings.fanPressureMeasurement != 'inH2o') {
      let tmpVal = this.convertUnitsService.value(this.pointOne.form.controls.flowRate.value).from('inH2o').to(settings.fanPressureMeasurement);
      this.pointOne.form.patchValue({
        flowRate: this.psatService.roundVal(tmpVal, 2)
      })
    }
    if (settings.fanFlowRate != 'ft3/min') {
      let tmpVal = this.convertUnitsService.value(this.pointOne.form.controls.head.value).from('ft3/min').to(settings.fanFlowRate);
      let tmpVal2 = this.convertUnitsService.value(this.pointTwo.form.controls.head.value).from('ft3/min').to(settings.fanFlowRate);
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
      form: this.systemCurveService.initPumpCurveConstants(this.psat)
    };
    this.pointOne = {
      form: this.systemCurveService.initPumpPointForm(this.psat),
      fluidPower: 0
    };
    this.pointTwo = {
      form: this.systemCurveService.initPumpPointForm(),
      fluidPower: 0
    };
    this.pointTwo.form.patchValue({
      flowRate: '',
      head: ''
    })
  }

  initInFsat() {
    this.curveConstants = {
      form: this.systemCurveService.initFanCurveConstants(this.fsat)
    };
    this.pointOne = {
      form: this.systemCurveService.initFanPointForm(this.fsat),
      fluidPower: 0
    };
    this.pointTwo = {
      form: this.systemCurveService.initFanPointForm(),
      fluidPower: 0
    };
    this.pointTwo.form.patchValue({
      flowRate: '',
      head: ''
    })
  }


  initDefault() {
    if (!this.isFan) {
      this.curveConstants = {
        form: this.systemCurveService.initPumpCurveConstants()
      };
      this.pointOne = {
        form: this.systemCurveService.initPumpPointForm(),
        fluidPower: 0
      };
      this.pointTwo = {
        form: this.systemCurveService.initPumpPointForm(),
        fluidPower: 0
      };
    } else {
      this.curveConstants = {
        form: this.systemCurveService.initFanCurveConstants()
      };
      this.pointOne = {
        form: this.systemCurveService.initFanPointForm(),
        fluidPower: 0
      };
      this.pointTwo = {
        form: this.systemCurveService.initFanPointForm(),
        fluidPower: 0
      };
    }

    this.pointTwo.form.patchValue({
      flowRate: 0,
      head: 200
    })
  }


  initializeCalculator(reset?: boolean) {
    let systemCurve: SystemCurve;
    if (!this.isFan) {
      systemCurve = this.initializePsatCalculator();
    } else {
      systemCurve = this.initializeFsatCalculator();
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

  initializePsatCalculator() {
    let dataPoints = new Array<CurveData>();
    let baselinePoint: CurveData = {
      modName: this.psat.name,
      flowRate: this.psat.inputs.flow_rate,
      head: this.psat.inputs.head
    }
    dataPoints.push(baselinePoint)
    if (this.psat.modifications) {
      this.psat.modifications.forEach(mod => {
        let modPoint: CurveData = {
          modName: mod.psat.name,
          flowRate: mod.psat.inputs.flow_rate,
          head: mod.psat.inputs.head
        }
        dataPoints.push(modPoint);
      })
    }
    let systemCurve: SystemCurve = {
      specificGravity: this.psat.inputs.specific_gravity,
      systemLossExponent: 1.9,
      dataPoints: dataPoints,
      selectedP1Name: dataPoints[0].modName,
      selectedP2Name: dataPoints[1].modName
    }
    return systemCurve;
  }

  initializeFsatCalculator() {
    let dataPoints = new Array<CurveData>();
    let baselinePoint: CurveData = {
      modName: this.fsat.name,
      flowRate: this.fsat.fieldData.flowRate,
      head: this.fsat.fieldData.outletPressure - this.fsat.fieldData.inletPressure
    }
    dataPoints.push(baselinePoint)
    if (this.fsat.modifications) {
      this.fsat.modifications.forEach(mod => {
        let modPoint: CurveData = {
          modName: mod.fsat.name,
          flowRate: mod.fsat.fieldData.flowRate,
          head: mod.fsat.fieldData.outletPressure - mod.fsat.fieldData.inletPressure
        }
        dataPoints.push(modPoint);
      })
    }
    let systemCurve: SystemCurve = {
      specificGravity: this.fsat.fieldData.compressibilityFactor,
      systemLossExponent: 1.9,
      dataPoints: dataPoints,
      selectedP1Name: dataPoints[0].modName,
      selectedP2Name: dataPoints[1].modName
    }
    return systemCurve;
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
        this.indexedDbService.putCalculator(this.calculator).then(() => {
          this.calculatorDbService.setAll();
        });
      } else {
        this.saving = true;
        this.calculator.assessmentId = this.assessment.id;
        this.indexedDbService.addCalculator(this.calculator).then((result) => {
          this.calculatorDbService.setAll().then(() => {
            this.calculator.id = result;
            this.calcExists = true;
            this.saving = false;
          })
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
      if (!this.isFan) {
        this.pointOne.fluidPower = this.systemCurveService.getPumpFluidPower(this.pointOne.form.controls.head.value, this.pointOne.form.controls.flowRate.value, this.curveConstants.form.controls.specificGravity.value);
      } else {
        this.pointOne.fluidPower = this.systemCurveService.getFanFluidPower(this.pointOne.form.controls.head.value, this.pointOne.form.controls.flowRate.value, this.curveConstants.form.controls.specificGravity.value);
      }
    }
  }

  calculateP2Flow() {
    if (this.pointTwo.form.status == 'VALID') {
      if (!this.isFan) {
        this.pointTwo.fluidPower = this.systemCurveService.getPumpFluidPower(this.pointTwo.form.controls.head.value, this.pointTwo.form.controls.flowRate.value, this.curveConstants.form.controls.specificGravity.value);
      } else {
        this.pointTwo.fluidPower = this.systemCurveService.getFanFluidPower(this.pointTwo.form.controls.head.value, this.pointTwo.form.controls.flowRate.value, this.curveConstants.form.controls.specificGravity.value);
      }
    }
  }


  calculateValues() {
    if (this.pointOne.form.status == 'VALID' && this.pointTwo.form.status == 'VALID' && this.curveConstants.form.status == 'VALID') {
      this.lossCoefficient = this.systemCurveService.getLossCoefficient(
        this.pointOne.form.controls.flowRate.value,
        this.pointOne.form.controls.head.value,
        this.pointTwo.form.controls.flowRate.value,
        this.pointTwo.form.controls.head.value,
        this.curveConstants.form.controls.systemLossExponent.value
      );
      this.staticHead = this.systemCurveService.getStaticHead(
        this.pointOne.form.controls.flowRate.value,
        this.pointOne.form.controls.head.value,
        this.pointTwo.form.controls.flowRate.value,
        this.pointTwo.form.controls.head.value,
        this.curveConstants.form.controls.systemLossExponent.value
      );
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }


}
