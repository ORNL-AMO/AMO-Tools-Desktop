import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { PSAT } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { CompareService } from '../compare.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { UntypedFormGroup } from '@angular/forms';
import { MotorWarnings, PsatWarningService } from '../psat-warning.service';
import { MotorService } from './motor.service';
import { motorEfficiencyConstants } from '../psatConstants';
import { PsatService } from '../psat.service';
import { IntegrationStateService } from '../../shared/assessment-integration/integration-state.service';
@Component({
  selector: 'app-motor',
  templateUrl: './motor.component.html',
  styleUrls: ['./motor.component.css']
})
export class MotorComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Output('saved')
  saved = new EventEmitter<boolean>();
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  @Input()
  baseline: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  modificationIndex: number;

  efficiencyClasses: Array<{ value: number, display: string }>;
  frequencies: Array<number> = [
    50,
    60
  ];

  psatForm: UntypedFormGroup;
  motorWarnings: MotorWarnings;
  //disableFLAOptimized: boolean = false;
  idString: string;
  hasConnectedInventories: boolean;

  constructor(private psatWarningService: PsatWarningService, 
    private psatService: PsatService, 
    private integrationStateService: IntegrationStateService,
    private compareService: CompareService, 
    private helpPanelService: HelpPanelService, 
    private motorService: MotorService) { }

  ngOnInit() {
    this.efficiencyClasses = motorEfficiencyConstants;
    if (!this.baseline) {
      this.idString = 'psat_modification_' + this.modificationIndex;
    }
    else {
      this.idString = 'psat_baseline';
    }
    this.init();

    if (!this.selected) {
      this.disableForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      if (!this.selected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    }
    if (changes.modificationIndex && !changes.modificationIndex.isFirstChange() ||
      changes.psat && !changes.psat.isFirstChange()) {
      this.init();
    }
  }

  init() {
    this.hasConnectedInventories = this.integrationStateService.assessmentIntegrationState.getValue().hasThreeWayConnection;
    this.psatForm = this.motorService.getFormFromObj(this.psat.inputs);
    this.helpPanelService.currentField.next('lineFrequency');
    this.checkWarnings();
  }

  checkWarnings() {
    this.motorWarnings = this.psatWarningService.checkMotorWarnings(this.psat, this.settings, !this.baseline);
  }

  changeEfficiencyClass() {
    this.psatForm = this.motorService.updateFormEfficiencyValidators(this.psatForm);
    this.save();
  }

  changeLineFreq() {
    if (this.psatForm.controls.frequency.value == 60) {
      if (this.psatForm.controls.motorRPM.value == 1485) {
        this.psatForm.patchValue({
          motorRPM: 1780
        })
      }
    } else if (this.psatForm.controls.frequency.value == 50) {
      if (this.psatForm.controls.motorRPM.value == 1780) {
        this.psatForm.patchValue({
          motorRPM: 1485
        })
      }
    }
    this.save();
  }

  getFullLoadAmps() {
    if (!this.disableFLA()) {
      this.psatForm = this.psatService.setFormFullLoadAmps(this.psatForm, this.settings);
      this.save();
    }
  }

  disableFLA() {
    return this.motorService.disableFLA(this.psatForm);
  }

  disableForm() {
    this.psatForm.controls.frequency.disable();
    this.psatForm.controls.horsePower.disable();
    this.psatForm.controls.efficiencyClass.disable();
    //this.psatForm.disable();
  }

  enableForm() {
    this.psatForm.controls.frequency.enable();
    this.psatForm.controls.horsePower.enable();
    this.psatForm.controls.efficiencyClass.enable();
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
  }

  save() {
    this.psat.inputs = this.motorService.getInputsFromFrom(this.psatForm, this.psat.inputs);
    this.checkWarnings();
    this.saved.emit(this.selected);
  }

  canCompare() {
    if (this.compareService.baselinePSAT && this.compareService.modifiedPSAT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  isLineFreqDifferent() {
    if (this.canCompare()) {
      return this.compareService.isLineFreqDifferent();
    } else {
      return false;
    }
  }
  isMotorRatedPowerDifferent() {
    if (this.canCompare()) {
      return this.compareService.isMotorRatedPowerDifferent();
    } else {
      return false;
    }
  }
  isMotorRatedSpeedDifferent() {
    if (this.canCompare()) {
      return this.compareService.isMotorRatedSpeedDifferent();
    } else {
      return false;
    }
  }
  isEfficiencyClassDifferent() {
    if (this.canCompare()) {
      return this.compareService.isEfficiencyClassDifferent();
    } else {
      return false;
    }
  }
  isEfficiencyDifferent() {
    if (this.canCompare()) {
      return this.compareService.isEfficiencyDifferent();
    } else {
      return false;
    }
  }
  isMotorRatedVoltageDifferent() {
    if (this.canCompare()) {
      return this.compareService.isMotorRatedVoltageDifferent();
    } else {
      return false;
    }
  }
  isMotorRatedFlaDifferent() {
    if (this.canCompare()) {
      return this.compareService.isMotorRatedFlaDifferent();
    } else {
      return false;
    }
  }
}
