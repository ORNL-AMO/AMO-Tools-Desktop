import { Component, OnInit, Output, EventEmitter, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PsatService } from '../../../psat/psat.service';
import { PSAT } from '../../../shared/models/psat';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { Settings } from '../../../shared/models/settings';
import { SettingsService } from '../../../settings/settings.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator, HeadTool, HeadToolSuction } from '../../../shared/models/calculators';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
@Component({
  selector: 'app-head-tool',
  templateUrl: './head-tool.component.html',
  styleUrls: ['./head-tool.component.css']
})
export class HeadToolComponent implements OnInit {
  @Output('close')
  close = new EventEmitter<boolean>();
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;
  @Input()
  headToolResults: any;
  @Input()
  inAssessment: boolean;
  @Input()
  assessment: Assessment;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  results: any = {
    differentialElevationHead: 0.0,
    differentialPressureHead: 0.0,
    differentialVelocityHead: 0.0,
    estimatedSuctionFrictionHead: 0.0,
    estimatedDischargeFrictionHead: 0.0,
    pumpHead: 0.0
  }

  currentField: string = 'headToolType';

  headToolForm: FormGroup;
  headToolSuctionForm: FormGroup;
  headToolType: string = "Suction tank elevation";
  tabSelect: string = 'results';
  showSettings: boolean = false;
  settingsForm: FormGroup;
  canSave: boolean = false;
  isSavedCalc: boolean = false;
  calculator: Calculator;
  constructor(private formBuilder: FormBuilder, private psatService: PsatService, private calculatorDbService: CalculatorDbService, private indexedDbService: IndexedDbService, private settingsService: SettingsService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (this.inAssessment) {
      this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
      if (this.calculator) {
        if (this.calculator.headTool) {
          this.isSavedCalc = true;
          this.headToolForm = this.getHeadToolFormFromObj(this.calculator.headTool);
          this.headToolSuctionForm = this.getHeadToolSuctionFormFromObj(this.calculator.headToolSuction);
          this.headToolType = this.calculator.headToolType;
        } else {
          this.getFormFromSettings();
        }
      } else {
        this.getFormFromSettings();
      }
    } else {
      this.getFormFromSettings();
    }
    if (this.settingsService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsService.globalSettings.defaultPanelTab;
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

  getFormFromSettings() {
    if (!this.settings) {
      this.settings = this.settingsService.globalSettings;
      this.initForm(this.settings);
    } else {
      this.initForm(this.settings);
    }
  }

  initForm(settings: Settings) {
    this.headToolForm = this.initHeadToolForm(settings);
    this.headToolSuctionForm = this.initHeadToolSuctionForm(settings);
    if (this.psat) {
      this.headToolForm.patchValue({
        specificGravity: this.psat.inputs.specific_gravity,
        flowRate: this.psat.inputs.flow_rate,
      });
      this.headToolSuctionForm.patchValue({
        specificGravity: this.psat.inputs.specific_gravity,
        flowRate: this.psat.inputs.flow_rate,
      })
    }
  }

  editSettings() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    this.showSettings = true;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  closeTool() {
    this.close.emit(true);
  }

  applySettings() {
    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm)
    this.showSettings = false;
  }
  cancelSettings() {
    this.showSettings = false;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  save() {
    this.psat.inputs.head = this.results.pumpHead;
    if (this.inAssessment) {
      if (this.isSavedCalc) {
        this.calculator.headTool = this.getHeadToolFromForm(this.headToolForm);
        this.calculator.headToolSuction = this.getHeadToolSuctionFromForm(this.headToolSuctionForm);
        this.calculator.headToolType = this.headToolType;
        this.indexedDbService.putCalculator(this.calculator).then(() => {
          this.calculatorDbService.setAll().then(()=> {
            this.closeTool();
          })
        });
      } else {
        this.calculator = {
          headTool: this.getHeadToolFromForm(this.headToolForm),
          headToolSuction: this.getHeadToolSuctionFromForm(this.headToolSuctionForm),
          headToolType: this.headToolType,
          assessmentId: this.assessment.id
        }
        this.indexedDbService.addCalculator(this.calculator).then(() => {
          this.calculatorDbService.setAll().then(()=> {
            this.closeTool();
          })
        });;
      }
    } else {
      this.closeTool();
    }
  }

  roundVal(val: number, digits: number) {
    return Number(val.toFixed(digits))
  }

  calculateHeadTool() {
    let result = this.psatService.headTool(
      this.headToolForm.controls.specificGravity.value,
      this.headToolForm.controls.flowRate.value,
      this.headToolForm.controls.suctionPipeDiameter.value,
      this.headToolForm.controls.suctionGuagePressure.value,
      this.headToolForm.controls.suctionGuageElevation.value,
      this.headToolForm.controls.suctionLineLossCoefficients.value,
      this.headToolForm.controls.dischargePipeDiameter.value,
      this.headToolForm.controls.dischargeGaugePressure.value,
      this.headToolForm.controls.dischargeGaugeElevation.value,
      this.headToolForm.controls.dischargeLineLossCoefficients.value,
      this.settings
    );
    this.results.differentialElevationHead = result.differentialElevationHead;
    this.results.differentialPressureHead = result.differentialPressureHead;
    this.results.differentialVelocityHead = result.differentialVelocityHead;
    this.results.estimatedSuctionFrictionHead = result.estimatedSuctionFrictionHead;
    this.results.estimatedDischargeFrictionHead = result.estimatedDischargeFrictionHead;
    this.results.pumpHead = result.pumpHead;
    if (this.results.pumpHead > 0 && this.inAssessment) {
      this.canSave = true;
    }
  }


  calculateHeadToolSuctionTank() {
    let result = this.psatService.headToolSuctionTank(
      this.headToolSuctionForm.controls.specificGravity.value,
      this.headToolSuctionForm.controls.flowRate.value,
      this.headToolSuctionForm.controls.suctionPipeDiameter.value,
      this.headToolSuctionForm.controls.suctionTankGasOverPressure.value,
      this.headToolSuctionForm.controls.suctionTankFluidSurfaceElevation.value,
      this.headToolSuctionForm.controls.suctionLineLossCoefficients.value,
      this.headToolSuctionForm.controls.dischargePipeDiameter.value,
      this.headToolSuctionForm.controls.dischargeGaugePressure.value,
      this.headToolSuctionForm.controls.dischargeGaugeElevation.value,
      this.headToolSuctionForm.controls.dischargeLineLossCoefficients.value,
      this.settings
    );

    this.results.differentialElevationHead = result.differentialElevationHead;
    this.results.differentialPressureHead = result.differentialPressureHead;
    this.results.differentialVelocityHead = result.differentialVelocityHead;
    this.results.estimatedSuctionFrictionHead = result.estimatedSuctionFrictionHead;
    this.results.estimatedDischargeFrictionHead = result.estimatedDischargeFrictionHead;
    this.results.pumpHead = result.pumpHead;
    if (this.results.pumpHead > 0 && this.inAssessment) {
      this.canSave = true;
    }
  }

  setFormView(str: string) {
    this.headToolType = str;
  }

  initHeadToolSuctionForm(settings: Settings) {
    let smallUnit, pressureUnit;
    if (settings.distanceMeasurement == 'ft') {
      smallUnit = 'in'
    } else {
      smallUnit = 'mm'
    }

    return this.formBuilder.group({
      'suctionPipeDiameter': [this.roundVal(this.convertUnitsService.value(12).from('in').to(smallUnit), 2), Validators.required],
      'suctionTankGasOverPressure': [0, Validators.required],
      'suctionTankFluidSurfaceElevation': [this.roundVal(this.convertUnitsService.value(10).from('ft').to(settings.distanceMeasurement), 2), Validators.required],
      'suctionLineLossCoefficients': [.5, Validators.required],
      'dischargePipeDiameter': [this.roundVal(this.convertUnitsService.value(12).from('in').to(smallUnit), 2), Validators.required],
      'dischargeGaugePressure': [this.roundVal(this.convertUnitsService.value(124).from('psi').to(settings.pressureMeasurement), 2), Validators.required],
      'dischargeGaugeElevation': [this.roundVal(this.convertUnitsService.value(10).from('ft').to(settings.distanceMeasurement), 2), Validators.required],
      'dischargeLineLossCoefficients': [1, Validators.required],
      'specificGravity': [1, Validators.required],
      'flowRate': [this.roundVal(this.convertUnitsService.value(2000).from('gpm').to(settings.flowMeasurement), 2), Validators.required],
    })
  }

  initHeadToolForm(settings: Settings) {
    let smallUnit;
    if (settings.distanceMeasurement == 'ft') {
      smallUnit = 'in'
    } else {
      smallUnit = 'mm'
    }
    return this.formBuilder.group({
      'suctionPipeDiameter': [this.roundVal(this.convertUnitsService.value(12).from('in').to(smallUnit), 2), Validators.required],
      'suctionGuagePressure': [this.roundVal(this.convertUnitsService.value(5).from('psi').to(settings.pressureMeasurement), 2), Validators.required],
      'suctionGuageElevation': [this.roundVal(this.convertUnitsService.value(10).from('ft').to(settings.distanceMeasurement), 2), Validators.required],
      'suctionLineLossCoefficients': [.5, Validators.required],
      'dischargePipeDiameter': [this.roundVal(this.convertUnitsService.value(12).from('in').to(smallUnit), 2), Validators.required],
      'dischargeGaugePressure': [this.roundVal(this.convertUnitsService.value(124).from('psi').to(settings.pressureMeasurement), 2), Validators.required],
      'dischargeGaugeElevation': [this.roundVal(this.convertUnitsService.value(10).from('ft').to(settings.distanceMeasurement), 2), Validators.required],
      'dischargeLineLossCoefficients': [1, Validators.required],
      'specificGravity': [1, Validators.required],
      'flowRate': [this.roundVal(this.convertUnitsService.value(2000).from('gpm').to(settings.flowMeasurement), 2), Validators.required],
    })
  }


  getHeadToolFormFromObj(headTool: HeadTool) {
    return this.formBuilder.group({
      'suctionPipeDiameter': [headTool.suctionPipeDiameter, Validators.required],
      'suctionGuagePressure': [headTool.suctionGaugePressure, Validators.required],
      'suctionGuageElevation': [headTool.suctionGaugeElevation, Validators.required],
      'suctionLineLossCoefficients': [headTool.suctionLineLossCoefficients, Validators.required],
      'dischargePipeDiameter': [headTool.dischargePipeDiameter, Validators.required],
      'dischargeGaugePressure': [headTool.dischargeGaugePressure, Validators.required],
      'dischargeGaugeElevation': [headTool.dischargeGaugeElevation, Validators.required],
      'dischargeLineLossCoefficients': [headTool.dischargeLineLossCoefficients, Validators.required],
      'specificGravity': [headTool.specificGravity, Validators.required],
      'flowRate': [headTool.flowRate, Validators.required],
    })
  }

  getHeadToolSuctionFormFromObj(headToolSuction: HeadToolSuction) {
    return this.formBuilder.group({
      'suctionPipeDiameter': [headToolSuction.suctionPipeDiameter, Validators.required],
      'suctionTankGasOverPressure': [headToolSuction.suctionTankGasOverPressure, Validators.required],
      'suctionTankFluidSurfaceElevation': [headToolSuction.suctionTankFluidSurfaceElevation, Validators.required],
      'suctionLineLossCoefficients': [headToolSuction.suctionLineLossCoefficients, Validators.required],
      'dischargePipeDiameter': [headToolSuction.dischargePipeDiameter, Validators.required],
      'dischargeGaugePressure': [headToolSuction.dischargeGaugePressure, Validators.required],
      'dischargeGaugeElevation': [headToolSuction.dischargeGaugeElevation, Validators.required],
      'dischargeLineLossCoefficients': [headToolSuction.dischargeLineLossCoefficients, Validators.required],
      'specificGravity': [headToolSuction.specificGravity, Validators.required],
      'flowRate': [headToolSuction.flowRate, Validators.required],
    })
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
    }
    return headTool;
  }

  getHeadToolSuctionFromForm(form: FormGroup) {
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
    }
    return headToolSuction;
  }
}
