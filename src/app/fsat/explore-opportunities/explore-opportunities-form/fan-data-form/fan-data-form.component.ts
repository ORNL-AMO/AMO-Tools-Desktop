import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT } from '../../../../shared/models/fans';
import { FanTypes, Drives } from '../../../fanOptions';
import { ModifyConditionsService } from '../../../modify-conditions/modify-conditions.service';
import { HelpPanelService } from '../../../help-panel/help-panel.service';
import { FsatWarningService } from '../../../fsat-warning.service';
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
  specifiedError1: string = null;
  specifiedError2: string = null;
  baselineSpecifiedDriveEfficiencyError: string = null;
  modificationSpecifiedDriveEfficiencyError: string = null;
  constructor(private modifyConditionsService: ModifyConditionsService, private helpPanelService: HelpPanelService, private fsatWarningService: FsatWarningService) { }

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
    this.initFanSpecified();
    this.initMotorDrive();
    this.initPumpType();
    this.initFanData();
    this.checkWarnings();
  }
  initPumpType() {
    if (this.fsat.fanSetup.fanType != this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanType) {
      this.showFanType = true;
    } else {
      this.showFanType = false;
    }
  }

  initMotorDrive() {
    if (this.fsat.fanSetup.drive != this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.drive) {
      this.showMotorDrive = true;
    } else {
      this.showMotorDrive = false;
    }
  }

  initFanSpecified() {
    if (this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanSpecified != this.fsat.fanSetup.fanSpecified) {
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
      this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanSpecified = this.fsat.fanSetup.fanSpecified;
      this.calculate();
    }
  }

  toggleFanType() {
    if (this.showFanType == false) {
      this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanType = this.fsat.fanSetup.fanType;
      this.calculate();
    }
  }
  toggleMotorDrive() {
    if (this.showMotorDrive === false) {
      this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.drive = this.fsat.fanSetup.drive;
      this.calculate();
    }
  }

  setFanTypes() {
    this.checkFanTypes();
    if (!this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanSpecified) {
      this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanSpecified = 90;
    }
    if (!this.fsat.fanSetup.fanSpecified) {
      this.fsat.fanSetup.fanSpecified = 90;
    }
    this.calculate();
  }

  checkWarnings() {
    this.specifiedError1 = this.fsatWarningService.checkFanWarnings(this.fsat.fanSetup).fanEfficiencyError;
    this.specifiedError2 = this.fsatWarningService.checkFanWarnings(this.fsat.modifications[this.exploreModIndex].fsat.fanSetup).fanEfficiencyError;
    if (this.fsat.fanSetup.drive == 4) {
      this.checkEfficiency(this.fsat.fanSetup.specifiedDriveEfficiency, 5);
    }
    else {
      this.baselineSpecifiedDriveEfficiencyError = null;
    }
    if (this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.drive == 4) {
      this.checkEfficiency(this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.specifiedDriveEfficiency, 6);
    }
    else {
      this.modificationSpecifiedDriveEfficiencyError = null;
    }
  }

  checkFanTypes() {
    if (this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanType == 10) {
      this.showFanSpecified = true;
    } else {
      this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanSpecified = null;
    }
    if (this.fsat.fanSetup.fanType == 10) {
      this.showFanSpecified = true;
    } else {
      this.fsat.fanSetup.fanSpecified = null;
    }
    if (this.fsat.fanSetup.fanType != 10 && this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanType != 10) {
      this.showFanSpecified = false;
    }
  }

  checkEfficiency(val: number, num: number) {
    if (num != 5 && num != 6) {
      this.calculate();
    }
    if (val > 100) {
      this.setErrorMessage(num, "Unrealistic efficiency, shouldn't be greater then 100%");
      return false;
    }
    else if (val == 0) {
      this.setErrorMessage(num, "Cannot have 0% efficiency");
      return false;
    }
    else if (val < 0) {
      this.setErrorMessage(num, "Cannot have negative efficiency");
      return false;
    }
    else {
      this.setErrorMessage(num, null);
      return true;
    }
  }
  setErrorMessage(num: number, str: string) {
    if (num == 3) {
      this.specifiedError1 = str;
    } else if (num == 4) {
      this.specifiedError2 = str;
    } else if (num == 5) {
      this.baselineSpecifiedDriveEfficiencyError = str;
    } else if (num == 6) {
      this.modificationSpecifiedDriveEfficiencyError = str;
    }
  }

  calculate() {
    this.emitCalculate.emit(true);
    this.checkWarnings();
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
    this.modifyConditionsService.modifyConditionsTab.next('fan-setup')
  }
}
