import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PsatService } from '../../../psat/psat.service';
import { PumpCurveService } from './pump-curve.service';
import { PumpCurveForm, PumpCurveDataRow, Calculator, CurveData, SystemCurve } from '../../../shared/models/calculators';
import { Assessment } from '../../../shared/models/assessment';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { FSAT } from '../../../shared/models/fans';
import { SystemCurveService } from '../system-curve/system-curve.service';
import { FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pump-curve',
  templateUrl: './pump-curve.component.html',
  styleUrls: ['./pump-curve.component.css'],
  animations: [
    trigger('collapsed', [
      state('open', style({
        height: 500,
        opacity: 100
      })),
      state('closed', style({
        height: 0,
        opacity: 0
      })),
      transition('closed => open', animate('.5s ease-in')),
      transition('open => closed', animate('.5s ease-out'))
    ])
  ]
})
export class PumpCurveComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;
  @Input()
  inAssessment: boolean;
  @Input()
  assessment: Assessment;
  @Input()
  isFan: boolean;
  @Input()
  fsat: FSAT;


  tabSelect: string = 'results';

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;
  pumpCurveCollapsed: string = 'open';
  systemCurveCollapsed: string = 'open';

  //system curve variables
  pointOne: { form: FormGroup, fluidPower: number };
  pointTwo: { form: FormGroup, fluidPower: number };
  curveConstants: { form: FormGroup };
  staticHead: number;
  lossCoefficient: number;

  pumpCurveForm: PumpCurveForm;
  toggleCalculate: boolean = false;
  currentField: string = 'maxFlow';
  selectedFormView: string;
  regEquation: string;
  calculator: Calculator;
  calcExists: boolean = false;
  saving: boolean = false;
  pumpFormExists: boolean = false;
  showSystemCurveForm: boolean = false;
  focusedForm: string = 'pump-curve';
  calcMethodSubscription: Subscription;
  regEquationSubscription: Subscription;
  constructor(private systemCurveService: SystemCurveService, private indexedDbService: IndexedDbService, private calculatorDbService: CalculatorDbService, private settingsDbService: SettingsDbService, private psatService: PsatService, private convertUnitsService: ConvertUnitsService, private pumpCurveService: PumpCurveService) { }

  ngOnInit() {
    //get systen settings if using stand alone calculator
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (this.inAssessment) {
      this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
      if (this.calculator) {
        this.calcExists = true;
        if (this.calculator.pumpCurveForm) {
          this.pumpFormExists = true;
          this.pumpCurveForm = this.calculator.pumpCurveForm;
          this.subscribe();
        }
        else {
          this.initForm();
          this.subscribe();
        }

        //system curve merge
        if (this.calculator.systemCurve) {
          this.initDefault();
          this.setPointValuesFromCalc(true);
          this.curveConstants.form.patchValue({
            specificGravity: this.calculator.systemCurve.specificGravity,
            systemLossExponent: this.calculator.systemCurve.systemLossExponent
          })
          this.showSystemCurveForm = true;
        }
        else {
          this.initializeCalculator();
          this.initDefault();
          this.setPointValuesFromCalc(true);
          this.curveConstants.form.patchValue({
            specificGravity: this.calculator.systemCurve.specificGravity,
            systemLossExponent: this.calculator.systemCurve.systemLossExponent
          })
          this.showSystemCurveForm = true;
        }
      }
      else {
        this.initForm();
        this.subscribe();
        //system curve merge
        this.initializeCalculator();
        this.initDefault();
        this.setPointValuesFromCalc(true);
        this.curveConstants.form.patchValue({
          specificGravity: this.calculator.systemCurve.specificGravity,
          systemLossExponent: this.calculator.systemCurve.systemLossExponent
        })
        this.showSystemCurveForm = true;
      }
    } else {
      this.initForm();
      this.subscribe();
      this.showSystemCurveForm = true;
    }
    if (this.isFan) {
      this.currentField = 'fanMaxFlow';
    }
    this.calculateValues();
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

  ngOnDestroy() {
    // this.pumpCurveService.calcMethod.next('Equation')
    if (!this.inAssessment && !this.isFan) {
      this.pumpCurveService.pumpCurveData = this.pumpCurveForm;
      this.pumpCurveService.pumpCurveConstants = this.curveConstants;
      this.pumpCurveService.pumpPointOne = this.pointOne;
      this.pumpCurveService.pumpPointTwo = this.pointTwo;
    } else if (!this.inAssessment && this.isFan) {
      this.pumpCurveService.fanCurveData = this.pumpCurveForm;
      this.pumpCurveService.fanCurveConstants = this.curveConstants;
      this.pumpCurveService.fanPointOne = this.pointOne;
      this.pumpCurveService.fanPointTwo = this.pointTwo;
    }
    this.calcMethodSubscription.unsubscribe();
    this.regEquationSubscription.unsubscribe();
  }

  initForm() {
    if (this.pumpCurveService.pumpCurveData && !this.inAssessment && !this.isFan) {
      this.pumpCurveForm = this.pumpCurveService.pumpCurveData;
      this.curveConstants = this.pumpCurveService.pumpCurveConstants;
      this.pointOne = this.pumpCurveService.pumpPointOne;
      this.pointTwo = this.pumpCurveService.pumpPointTwo;
    }
    else if (this.pumpCurveService.pumpCurveData && !this.inAssessment && this.isFan) {
      this.pumpCurveForm = this.pumpCurveService.fanCurveData;
      this.curveConstants = this.pumpCurveService.fanCurveConstants;
      this.pointOne = this.pumpCurveService.fanPointOne;
      this.pointTwo = this.pumpCurveService.fanPointTwo;
    }
    else {
      this.pumpCurveForm = this.pumpCurveService.initForm();
      this.initDefault();
      if (!this.isFan) {
        this.convertPumpDefaults(this.settings);
      } else {
        this.convertFanDefaults(this.settings);
      }
    }
  }

  subscribe() {

    let headOrPressure: string;
    if (this.isFan) {
      headOrPressure = 'Pressure';
    } else {
      headOrPressure = 'Head'
    }

    this.calcMethodSubscription = this.pumpCurveService.calcMethod.subscribe(val => {
      this.selectedFormView = val;
    })

    this.regEquationSubscription = this.pumpCurveService.regEquation.subscribe(val => {
      if (val) {
        this.regEquation = val;
        for (let i = 0; i < this.pumpCurveForm.dataOrder; i++) {
          this.regEquation = this.regEquation.replace(/x/, '(flow)');
          this.regEquation = this.regEquation.replace('+ -', '- ');
        }
        this.regEquation = this.regEquation.replace('y', headOrPressure);
        this.regEquation = this.regEquation.replace('^2', '&#x00B2;');
        this.regEquation = this.regEquation.replace('^3', '&#x00B3;');
        this.regEquation = this.regEquation.replace('^4', '&#x2074;');
        this.regEquation = this.regEquation.replace('^5', '&#x2075;');
        this.regEquation = this.regEquation.replace('^6', '&#x2076;');
      } else {
        let tmpStr = this.pumpCurveForm.headFlow2 + '(flow)&#x00B2; + ' + this.pumpCurveForm.headFlow + ('(flow) +') + this.pumpCurveForm.headConstant;
        if (this.pumpCurveForm.headOrder > 2 && this.pumpCurveForm.headFlow3) {
          tmpStr = this.pumpCurveForm.headFlow3 + '(flow)&#x00B3; + ' + tmpStr;
        }
        if (this.pumpCurveForm.headOrder > 3 && this.pumpCurveForm.headFlow4) {
          tmpStr = this.pumpCurveForm.headFlow4 + '(flow)&#x2074; + ' + tmpStr;
        }
        if (this.pumpCurveForm.headOrder > 4 && this.pumpCurveForm.headFlow5) {
          tmpStr = this.pumpCurveForm.headFlow5 + '(flow)&#x2075; + ' + tmpStr;
        }
        if (this.pumpCurveForm.headOrder > 5 && this.pumpCurveForm.headFlow6) {
          tmpStr = this.pumpCurveForm.headFlow6 + '(flow)&#x2076; + ' + tmpStr;
        }
        this.regEquation = headOrPressure + ' = ' + tmpStr;
        for (let i = 0; i < this.pumpCurveForm.headOrder; i++) {
          this.regEquation = this.regEquation.replace('+ -', '- ');
        }
      }
    })
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setField(str: string, formStr: string) {
    this.currentField = str;
    this.focusedForm = formStr;
  }


  calculate() {
    if (this.pumpCurveForm.modifiedMeasurement != this.pumpCurveForm.baselineMeasurement) {
      if (this.pumpCurveForm.modifiedMeasurement != 0 && this.pumpCurveForm.baselineMeasurement != 0) {
        this.toggleCalculate = !this.toggleCalculate;
      }
    } else {
      this.toggleCalculate = !this.toggleCalculate;
    }
    if (this.inAssessment) {
      this.saveCalculator();
    }
  }

  saveCalculator() {
    if (!this.saving || this.calcExists) {
      if (this.calcExists) {
        this.calculator.pumpCurveForm = this.pumpCurveForm;
        this.indexedDbService.putCalculator(this.calculator).then(() => {
          this.calculatorDbService.setAll();
        });
      } else {
        this.saving = true;
        this.calculator = {
          assessmentId: this.assessment.id,
          pumpCurveForm: this.pumpCurveForm
        }
        this.indexedDbService.addCalculator(this.calculator).then((result) => {
          this.calculatorDbService.setAll().then(() => {
            this.calculator.id = result
            this.calcExists = true;
            this.saving = false;
          })
        })
      }
    }
  }

  setFormView(str: string) {
    this.selectedFormView = str;
    this.calculate();
  }


  //================== system curve functions ==================
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

  changes() {
    if (this.inAssessment) {
      this.saveCalculator();
    } else {
      this.calculateP1Flow();
      this.calculateP2Flow();
      this.calculateValues();
    }
  }


  toggleSystemCurveCollapse() {
    if (this.systemCurveCollapsed == 'open') {
      this.systemCurveCollapsed = 'closed';
    } else {
      this.systemCurveCollapsed = 'open';
    }
  }

  togglePumpCurveCollapse() {
    if (this.pumpCurveCollapsed == 'open') {
      this.pumpCurveCollapsed = 'closed';
    } else {
      this.pumpCurveCollapsed = 'open';
    }
  }
}
