import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FanSetupService } from './fan-setup.service';
import { FormGroup } from '@angular/forms';
import { FanSetup } from '../../shared/models/fans';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { FanTypes, Drives } from '../fanOptions';
import { CompareService } from '../compare.service';
import { Settings } from '../../shared/models/settings';
@Component({
  selector: 'app-fan-setup',
  templateUrl: './fan-setup.component.html',
  styleUrls: ['./fan-setup.component.css']
})
export class FanSetupComponent implements OnInit {
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;
  @Input()
  fanSetup: FanSetup;
  @Input()
  modificationIndex: number;
  @Output('emitSave')
  emitSave = new EventEmitter<FanSetup>();
  @Input()
  settings: Settings;

  drives: Array<{ display: string, value: number }>;
  fanTypes: Array<{ display: string, value: number }>;
  fanForm: FormGroup;
  fanEfficiencyError: string = null;
  fanSpeedError: string = null;
  constructor(private compareService: CompareService, private fanSetupService: FanSetupService, private helpPanelService: HelpPanelService) { }

  ngOnInit() {
    this.drives = Drives;
    this.fanTypes = FanTypes;
    this.init();
    if (!this.selected) {
      this.disableForm();
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected) {
        this.enableForm();
      } else {
        this.disableForm();
      }
    }
    if (changes.modificationIndex && !changes.modificationIndex.firstChange) {
      this.init();
    }
  }

  init() {
    this.fanForm = this.fanSetupService.getFormFromObj(this.fanSetup);
  }
  disableForm() {
    this.fanForm.controls.fanType.disable();
    this.fanForm.controls.drive.disable();
  }

  enableForm() {
    this.fanForm.controls.fanType.enable();
    this.fanForm.controls.drive.enable();
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
  }

  checkForWarnings() {
    //fanEfficiency.. commented out while custom efficiency not implemented

    if (this.fanForm.controls.fanSpecified.value < 0) {
      this.fanEfficiencyError = 'Value must be greater than or equal to 0';
    } else if (this.fanForm.controls.fanSpecified.value > 100) {
      this.fanEfficiencyError = 'Value must be less than or equal to 100';
    } else {
      this.fanEfficiencyError = null;
    }

    //fanSpeed
    if (this.fanForm.controls.fanSpeed.value < 0) {
      this.fanSpeedError = 'Fan speed must be greater than or equal to 0';
    } else if (this.fanForm.controls.fanSpeed.value > 5000) {
      this.fanSpeedError = 'Fan speed must be less than or equal to 5000';
    } else {
      this.fanSpeedError = null;
    }
  }

  save() {
    this.checkForWarnings();
    this.fanSetup = this.fanSetupService.getObjFromForm(this.fanForm);
    this.emitSave.emit(this.fanSetup);
  }

  canCompare() {
    if (this.compareService.baselineFSAT && this.compareService.modifiedFSAT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  isFanTypeDifferent() {
    if (this.canCompare()) {
      return this.compareService.isFanTypeDifferent();
    } else {
      return false;
    }
  }

  isFanSpeedDifferent() {
    if (this.canCompare()) {
      return this.compareService.isFanSpeedDifferent();
    } else {
      return false;
    }
  }

  isDriveDifferent() {
    if (this.canCompare()) {
      return this.compareService.isDriveDifferent();
    } else {
      return false;
    }
  }

}
