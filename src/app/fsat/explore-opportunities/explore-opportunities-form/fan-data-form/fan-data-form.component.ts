import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT } from '../../../../shared/models/fans';
import { FanTypes, Drives } from '../../../fanOptions';
import { ModifyConditionsService } from '../../../modify-conditions/modify-conditions.service';
import { HelpPanelService } from '../../../help-panel/help-panel.service';
import { FsatWarningService } from '../../../fsat-warning.service';
import { FormGroup, Validators } from '@angular/forms';
import { FanSetupService } from '../../../fan-setup/fan-setup.service';
@Component({
  selector: 'app-fan-data-form',
  templateUrl: './fan-data-form.component.html',
  styleUrls: ['./fan-data-form.component.css']
})
export class FanDataFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Input()
  fsat: FSAT;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();

  drives: Array<{ display: string, value: number }>;
  fanTypes: Array<{ display: string, value: number }>;
  showFanData: boolean = false;
  showFanType: boolean = false;
  showMotorDrive: boolean = false;
  showFanSpecified: boolean = false;
  baselineForm: FormGroup;
  modificationForm: FormGroup;

  constructor(private modifyConditionsService: ModifyConditionsService, private helpPanelService: HelpPanelService, private fanSetupService: FanSetupService) { }

  ngOnInit() {
    this.drives = Drives;
    this.fanTypes = FanTypes;
    this.init();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.init()
      }
    }
  }

  init() {
    this.baselineForm = this.fanSetupService.getFormFromObj(this.fsat.fanSetup);
    this.baselineForm.disable();
    this.modificationForm = this.fanSetupService.getFormFromObj(this.fsat.modifications[this.exploreModIndex].fsat.fanSetup);

    this.initFanSpecified();
    this.initMotorDrive();
    this.initPumpType();
    this.initFanData();
  }
  initPumpType() {
    if (this.baselineForm.controls.fanType.value != this.modificationForm.controls.fanType.value) {
      this.showFanType = true;
    } else {
      this.showFanType = false;
    }
  }

  initMotorDrive() {
    if (this.baselineForm.controls.drive.value != this.modificationForm.controls.drive.value) {
      this.showMotorDrive = true;
    } else {
      this.showMotorDrive = false;
    }
  }

  initFanSpecified() {
    if (this.modificationForm.controls.fanSpecified.value != this.baselineForm.controls.fanSpecified.value) {
      this.showFanSpecified = true;
    } else {
      this.showFanSpecified = false;
    }

  }

  initFanData() {
    if (this.showMotorDrive || this.showFanSpecified || this.showFanType) {
      this.showFanData = true;
    } else {
      this.showFanData = false;
    }
  }

  toggleFanData() {
    if (this.showFanData == false) {
      this.showFanSpecified = false;
      this.showFanType = false;
      this.showMotorDrive = false;
      this.toggleFanSpecified();
      this.toggleFanType();
      this.toggleMotorDrive();
    }
  }
  toggleFanSpecified() {
    if (this.showFanSpecified == false) {
      this.modificationForm.controls.fanSpecified.patchValue(this.baselineForm.controls.fanSpecified.value);
      this.calculate();
    }
  }

  toggleFanType() {
    if (this.showFanType == false) {
      this.modificationForm.controls.fanType.patchValue(this.baselineForm.controls.fanType.value);
      this.calculate();
    }
  }
  toggleMotorDrive() {
    if (this.showMotorDrive === false) {
      this.modificationForm.controls.drive.patchValue(this.baselineForm.controls.drive.value);
      this.calculate();
    }
  }

  setFanTypes() {
    if (this.modificationForm.controls.fanType.value == 10 || this.baselineForm.controls.fanType.value == 10) {
      this.showFanSpecified = true;
    }else{
       this.showFanSpecified = false;
    }
    if (!this.modificationForm.controls.fanSpecified) {
      this.modificationForm.controls.fanSpecified.patchValue(90);
    }
    if (!this.baselineForm.controls.fanSpecified) {
      this.baselineForm.controls.fanSpecified.patchValue(90);
    }    
    this.modificationForm = this.fanSetupService.changeFanType(this.modificationForm);
    this.calculate();
  }

  changeDriveType() {
    this.modificationForm = this.fanSetupService.changeDriveType(this.modificationForm);
    this.calculate();
  }

  calculate() {
    this.fsat.modifications[this.exploreModIndex].fsat.fanSetup = this.fanSetupService.getObjFromForm(this.modificationForm);
    this.emitCalculate.emit(true);
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
    this.modifyConditionsService.modifyConditionsTab.next('fan-setup')
  }
}
