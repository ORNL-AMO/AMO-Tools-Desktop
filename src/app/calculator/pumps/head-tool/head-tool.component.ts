import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PsatService } from '../../../psat/psat.service';
import { PSAT } from '../../../shared/models/psat';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { Settings } from '../../../shared/models/settings';
import { SettingsService } from '../../../settings/settings.service';

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
  headToolResults: any ;
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

  headToolForm: any;
  headToolSuctionForm: any;
  headToolType: string = "Suction tank elevation, gas space pressure, and discharged line pressure";
  tabSelect: string = 'results';
  showSettings: boolean = false;
  settingsForm: any;
  constructor(private formBuilder: FormBuilder, private psatService: PsatService, private indexedDbService: IndexedDbService, private settingsService: SettingsService) { }

  ngOnInit() {
    this.headToolForm = this.initHeadToolForm();
    this.headToolSuctionForm = this.initHeadToolSuctionForm();
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
    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(
        results => {
          if (results.length != 0) {
            this.settings = results[0];
          }
        }
      )
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
  cancelSettings(){
    this.showSettings = false;
  }

  save() {
    // this.headToolResults.differentialElevationHead = this.results.differentialElevationHead;
    // this.headToolResults.differentialPressureHead = this.results.differentialPressureHead;
    // this.headToolResults.differentialVelocityHead = this.results.differentialVelocityHead;
    // this.headToolResults.estimatedSuctionFrictionHead = this.results.estimatedSuctionFrictionHead;
    // this.headToolResults.estimatedDischargeFrictionHead = this.results.estimatedDischargeFrictionHead;
    // this.headToolResults.pumpHead = this.results.pumpHead;
    this.psat.inputs.head = this.results.pumpHead;
    this.closeTool();
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
  }

  initHeadToolSuctionForm() {
    return this.formBuilder.group({
      'suctionPipeDiameter': ['', Validators.required],
      'suctionTankGasOverPressure': ['', Validators.required],
      'suctionTankFluidSurfaceElevation': ['', Validators.required],
      'suctionLineLossCoefficients': ['', Validators.required],
      'dischargePipeDiameter': ['', Validators.required],
      'dischargeGaugePressure': ['', Validators.required],
      'dischargeGaugeElevation': ['', Validators.required],
      'dischargeLineLossCoefficients': ['', Validators.required],
      'specificGravity': ['', Validators.required],
      'flowRate': ['', Validators.required],
    })
  }

  initHeadToolForm() {
    return this.formBuilder.group({
      'suctionPipeDiameter': ['', Validators.required],
      'suctionGuagePressure': ['', Validators.required],
      'suctionGuageElevation': ['', Validators.required],
      'suctionLineLossCoefficients': ['', Validators.required],
      'dischargePipeDiameter': ['', Validators.required],
      'dischargeGaugePressure': ['', Validators.required],
      'dischargeGaugeElevation': ['', Validators.required],
      'dischargeLineLossCoefficients': ['', Validators.required],
      'specificGravity': ['', Validators.required],
      'flowRate': ['', Validators.required],
    })
  }

}
