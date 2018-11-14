import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT } from '../../../../shared/models/fans';
import { FanTypes, Drives } from '../../../fanOptions';
import { ModifyConditionsService } from '../../../modify-conditions/modify-conditions.service';
import { HelpPanelService } from '../../../help-panel/help-panel.service';
import { FormGroup } from '@angular/forms';
import { FanSetupService } from '../../../fan-setup/fan-setup.service';
import { FsatService } from '../../../fsat.service';
import { FanEfficiencyInputs } from '../../../../calculator/fans/fan-efficiency/fan-efficiency.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
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
  showFanType: boolean = false;
  showMotorDrive: boolean = false;
  baselineForm: FormGroup;
  modificationForm: FormGroup;
  baselineFanEfficiency: number;
  constructor(private convertUnitsService: ConvertUnitsService, private modifyConditionsService: ModifyConditionsService, private fsatService: FsatService, private helpPanelService: HelpPanelService, private fanSetupService: FanSetupService) { }

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
    this.baselineForm = this.fanSetupService.getFormFromObj(this.fsat.fanSetup, false);
    this.baselineForm.disable();
    this.modificationForm = this.fanSetupService.getFormFromObj(this.fsat.modifications[this.exploreModIndex].fsat.fanSetup, true);
    this.baselineFanEfficiency = this.fsatService.getResults(this.fsat, true, this.settings).fanEfficiency;
    this.baselineFanEfficiency = this.convertUnitsService.roundVal(this.baselineFanEfficiency, 2);
    this.initMotorDrive();
    this.initFanType();
  }
  initFanType() {
    if (this.modificationForm.controls.fanType.value == 12) {
      this.modificationForm.controls.fanType.disable();
      if (this.modificationForm.controls.fanEfficiency.value != this.baselineFanEfficiency) {
        this.showFanType = true;
      }
    } else {
      if (this.baselineForm.controls.fanType.value != this.modificationForm.controls.fanType.value) {
        this.showFanType = true;
      } else {
        this.showFanType = false;
      }
      this.modificationForm.controls.fanEfficiency.disable();
    }
  }

  initMotorDrive() {
    if (this.baselineForm.controls.drive.value != this.modificationForm.controls.drive.value) {
      this.showMotorDrive = true;
    } else {
      this.showMotorDrive = false;
    }
  }


  toggleFanType() {
    if (this.showFanType == false) {
      this.disableFanType();
    }
  }

  toggleMotorDrive() {
    if (this.showMotorDrive === false) {
      this.modificationForm.controls.drive.patchValue(this.baselineForm.controls.drive.value);
      this.calculate();
    }
  }

  enableFanType() {
    this.modificationForm.controls.fanType.patchValue(this.baselineForm.controls.fanType.value);
    this.modificationForm.controls.fanType.enable();
    this.getFanEfficiency();
  }

  disableFanType() {
    this.modificationForm.controls.fanEfficiency.patchValue(this.baselineFanEfficiency);
    this.modificationForm.controls.fanEfficiency.enable();
    this.modificationForm.controls.fanType.patchValue(12);
    this.modificationForm.controls.fanType.disable();
    this.calculate();
  }

  getFanEfficiency() {
    let inputs: FanEfficiencyInputs = {
      fanType: this.modificationForm.controls.fanType.value,
      fanSpeed: this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanSpeed,
      inletPressure: this.fsat.modifications[this.exploreModIndex].fsat.fieldData.inletPressure,
      outletPressure: this.fsat.modifications[this.exploreModIndex].fsat.fieldData.outletPressure,
      flowRate: this.fsat.modifications[this.exploreModIndex].fsat.fieldData.flowRate,
      compressibility: this.fsat.modifications[this.exploreModIndex].fsat.fieldData.compressibilityFactor
    }
    let tmpEfficiency: number = this.fsatService.optimalFanEfficiency(inputs, this.settings);
    tmpEfficiency = this.convertUnitsService.roundVal(tmpEfficiency, 2);
    this.modificationForm.controls.fanEfficiency.patchValue(tmpEfficiency);
    this.modificationForm.controls.fanEfficiency.disable();
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
