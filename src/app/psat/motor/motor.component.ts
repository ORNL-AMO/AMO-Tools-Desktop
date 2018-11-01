import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { PSAT } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { CompareService } from '../compare.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { FormGroup } from '@angular/forms';
import { MotorWarnings, PsatWarningService } from '../psat-warning.service';
import { MotorService } from './motor.service';
import { motorEfficiencyConstants } from '../psatConstants';
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

  // horsePowers: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000, 50000];
  // horsePowersPremium: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500];
  // kWatts: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000];
  // kWattsPremium: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355];

  frequencies: Array<number> = [
    50,
    60
  ];

  //options: Array<any>;
  //counter: any;
  psatForm: FormGroup;
  //isFirstChange: boolean = true;
  //formValid: boolean;
  motorWarnings: MotorWarnings;
  disableFLAOptimized: boolean = false;
  idString: string;
  constructor(private psatWarningService: PsatWarningService, private compareService: CompareService, private helpPanelService: HelpPanelService, private motorService: MotorService) { }

  ngOnInit() {
    this.efficiencyClasses = motorEfficiencyConstants;
    if (!this.baseline) {
      this.idString = 'psat_modification_' + this.modificationIndex;
    }
    else {
      this.idString = 'psat_baseline';
    }
    this.init();
    if (this.psat.inputs.optimize_calculation) {
      this.disableOptimized();
    }
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
    if (changes.modificationIndex && !changes.modificationIndex.isFirstChange()) {
      this.init();
    }
  }

  init() {
    this.psatForm = this.motorService.getFormFromObj(this.psat.inputs);
    this.helpPanelService.currentField.next('lineFrequency');
    this.checkWarnings();
  }

  checkWarnings() {
    this.motorWarnings = this.psatWarningService.checkMotorWarnings(this.psat, this.settings)
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
      this.psatForm = this.motorService.setFormFullLoadAmps(this.psatForm, this.settings);
      this.save();
    }
  }

  disableFLA() {
    if (!this.disableFLAOptimized) {
      return this.motorService.disableFLA(this.psatForm);
    } else {
      return true;
    }
  }

  disableOptimized() {
    this.psatForm.controls.horsePower.disable();
    this.psatForm.controls.efficiencyClass.disable();
    this.psatForm.controls.efficiency.disable();
    this.psatForm.controls.fullLoadAmps.disable();
    this.disableFLAOptimized = true;
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
    if (this.psat.inputs.optimize_calculation) {
      this.disableOptimized();
    }
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
  }

  save() {
    this.psat.inputs = this.motorService.getInputsFromFrom(this.psatForm, this.psat.inputs);
    this.motorWarnings = this.psatWarningService.checkMotorWarnings(this.psat, this.settings);
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
