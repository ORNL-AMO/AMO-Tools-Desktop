import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PsatService } from '../../../psat/psat.service';
import { PSAT } from '../../../shared/models/psat';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { Settings } from '../../../shared/models/settings';
import { SettingsService } from '../../../settings/settings.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
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


  results: any = {
    differentialElevationHead: 0.0,
    differentialPressureHead: 0.0,
    differentialVelocityHead: 0.0,
    estimatedSuctionFrictionHead: 0.0,
    estimatedDischargeFrictionHead: 0.0,
    pumpHead: 0.0
  }

  currentField: string = 'headToolType';

  headToolForm: any;
  headToolSuctionForm: any;
  headToolType: string = "Suction tank elevation";
  tabSelect: string = 'results';
  showSettings: boolean = false;
  settingsForm: any;
  canSave: boolean = false;
  constructor(private formBuilder: FormBuilder, private psatService: PsatService, private indexedDbService: IndexedDbService, private settingsService: SettingsService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {

    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(
        results => {
          if (results.length != 0) {
            this.settings = results[0];
            this.initForm(this.settings);
          }
        }
      )
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

  save() {
    this.psat.inputs.head = this.results.pumpHead;
    this.closeTool();
  }

  roundVal(val: number, digits: number) {
    return Number(val.toFixed(digits))
  }

  calculateHeadTool() {
    let result = this.psatService.headTool(
      this.headToolForm.value.specificGravity,
      this.headToolForm.value.flowRate,
      this.headToolForm.value.suctionPipeDiameter,
      this.headToolForm.value.suctionGuagePressure,
      this.headToolForm.value.suctionGuageElevation,
      this.headToolForm.value.suctionLineLossCoefficients,
      this.headToolForm.value.dischargePipeDiameter,
      this.headToolForm.value.dischargeGaugePressure,
      this.headToolForm.value.dischargeGaugeElevation,
      this.headToolForm.value.dischargeLineLossCoefficients,
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
      this.headToolSuctionForm.value.specificGravity,
      this.headToolSuctionForm.value.flowRate,
      this.headToolSuctionForm.value.suctionPipeDiameter,
      this.headToolSuctionForm.value.suctionTankGasOverPressure,
      this.headToolSuctionForm.value.suctionTankFluidSurfaceElevation,
      this.headToolSuctionForm.value.suctionLineLossCoefficients,
      this.headToolSuctionForm.value.dischargePipeDiameter,
      this.headToolSuctionForm.value.dischargeGaugePressure,
      this.headToolSuctionForm.value.dischargeGaugeElevation,
      this.headToolSuctionForm.value.dischargeLineLossCoefficients,
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

  changeField(str: string) {
    this.currentField = str;
  }

}
