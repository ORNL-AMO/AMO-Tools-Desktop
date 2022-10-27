import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT } from '../../../../shared/models/fans';
import { FanTypes, Drives } from '../../../fanOptions';
import { ModifyConditionsService } from '../../../modify-conditions/modify-conditions.service';
import { HelpPanelService } from '../../../help-panel/help-panel.service';
import { UntypedFormGroup } from '@angular/forms';
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
  @Input()
  baselineForm: UntypedFormGroup;
  @Input()
  modificationForm: UntypedFormGroup;
  @Input()
  baselineFanEfficiency: number;
  @Input()
  isVFD: boolean;

  drives: Array<{ display: string, value: number }>;
  fanTypes: Array<{ display: string, value: number }>;
  baselineFanType: string;

  constructor(private convertUnitsService: ConvertUnitsService, private modifyConditionsService: ModifyConditionsService, private fsatService: FsatService, private helpPanelService: HelpPanelService, private fanSetupService: FanSetupService) { }

  ngOnInit() {
    this.drives = Drives;
    this.fanTypes = FanTypes;
    this.init();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.init();
      }
    }

    if (changes.isVFD) {
      if (!changes.isVFD.isFirstChange()) {
        this.init();
      }
    }
  }

  init() {
    this.initMotorDrive();
    this.initFanType();
  }

  initFanType() {
    this.baselineFanType = this.fanTypes.find(fan => fan.value == this.baselineForm.controls.fanType.value).display;
    if (this.modificationForm.controls.fanType.value === 12) {
      if (this.modificationForm.controls.fanEfficiency.value !== this.baselineFanEfficiency) {
        this.fsat.modifications[this.exploreModIndex].exploreOppsShowFanType = { hasOpportunity: true, display: 'Install More Efficient Fan' };
      } 
      else {
        this.fsat.modifications[this.exploreModIndex].exploreOppsShowFanType = { hasOpportunity: false, display: 'Install More Efficient Fan' };
      }
    } else {
      this.fsat.modifications[this.exploreModIndex].exploreOppsShowFanType = { hasOpportunity: true, display: 'Install More Efficient Fan' };
    }
  }

  initMotorDrive() {
    if (this.baselineForm.controls.drive.value !== this.modificationForm.controls.drive.value) {
      this.fsat.modifications[this.exploreModIndex].exploreOppsShowDrive = { hasOpportunity: true, display: 'Install More Efficient Drive Type' };
    } else {
      this.fsat.modifications[this.exploreModIndex].exploreOppsShowDrive = { hasOpportunity: false, display: 'Install More Efficient Drive Type' };
    }
  }


  toggleFanType() {
    if (this.fsat.modifications[this.exploreModIndex].exploreOppsShowFanType.hasOpportunity === false) {
      this.disableFanType();
    }
  }

  toggleMotorDrive() {
    if (this.fsat.modifications[this.exploreModIndex].exploreOppsShowDrive.hasOpportunity === false) {
      this.modificationForm.controls.drive.patchValue(this.baselineForm.controls.drive.value);
      this.calculate();
    }
  }

  enableFanType() {
    this.modificationForm.controls.fanType.patchValue(this.baselineForm.controls.fanType.value);
    this.getFanEfficiency();
  }

  disableFanType() {
    this.modificationForm.controls.fanEfficiency.patchValue(this.baselineFanEfficiency);
    this.modificationForm.controls.fanType.patchValue(12);
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
    };
    let tmpEfficiency: number = this.fsatService.optimalFanEfficiency(inputs, this.settings);
    tmpEfficiency = this.convertUnitsService.roundVal(tmpEfficiency, 2);
    this.modificationForm.controls.fanEfficiency.patchValue(tmpEfficiency);
    this.calculate();
  }

  changeDriveType() {
    this.modificationForm = this.fanSetupService.changeDriveType(this.modificationForm);
    this.calculate();
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
    this.modifyConditionsService.modifyConditionsTab.next('fan-setup');
  }
}
