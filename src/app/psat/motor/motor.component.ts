import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { PsatService } from '../psat.service';
import { PSAT } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { CompareService } from '../compare.service';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
import { MotorWarnings, PsatWarningService } from '../psat-warning.service';
@Component({
  selector: 'app-motor',
  templateUrl: './motor.component.html',
  styleUrls: ['./motor.component.css']
})
export class MotorComponent implements OnInit {
  @Input()
  psat: PSAT;
  // @Output('changeField')
  // changeField = new EventEmitter<string>();
  @Output('isValid')
  isValid = new EventEmitter<boolean>();
  @Output('isInvalid')
  isInvalid = new EventEmitter<boolean>();
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

  efficiencyClasses: Array<string> = [
    'Standard Efficiency',
    'Energy Efficient',
    'Premium Efficient',
    'Specified'
  ];

  // horsePowers: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000, 50000];
  // horsePowersPremium: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500];
  // kWatts: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000];
  // kWattsPremium: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355];

  frequencies: Array<string> = [
    '50 Hz',
    '60 Hz'
  ];

  options: Array<any>;
  counter: any;
  psatForm: FormGroup;
  isFirstChange: boolean = true;
  formValid: boolean;
  motorWarnings: MotorWarnings;
  ratedPowerError: string = null;
  disableFLAOptimized: boolean = false;
  constructor(private psatWarningService: PsatWarningService, private psatService: PsatService, private compareService: CompareService, private windowRefService: WindowRefService, private helpPanelService: HelpPanelService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.init();
    // if (this.settings.powerMeasurement == 'hp') {
    //   this.options = this.horsePowers;
    // } else {
    //   this.options = this.kWatts;
    // }
    if (this.psat.inputs.optimize_calculation) {
      this.disableOptimized();
    }
    if (!this.selected) {
      this.disableForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.isFirstChange) {
      if (!this.selected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
      if (changes.modificationIndex) {
        this.init();
      }
    }
    else {
      this.isFirstChange = false;
    }
  }

  init() {
    this.psatForm = this.psatService.getFormFromPsat(this.psat.inputs);
    this.checkForm(this.psatForm);
    this.helpPanelService.currentField.next('lineFrequency');
    //init alert meessages
   // this.modifyPowerArrays();
    this.checkWarnings();
  }

  checkWarnings(){
    this.motorWarnings = this.psatWarningService.checkMotorWarnings(this.psat, this.settings)
  }

  changeLineFreq() {
    this.defaultRpm();
    this.save();
  }

  // modifyPowerArrays() {
  //   if (this.psatForm.controls.efficiencyClass.value === 'Premium Efficient') {
  //     if (this.settings.powerMeasurement === 'hp') {
  //       if (this.psatForm.controls.horsePower.value > 500) {
  //         this.psatForm.patchValue({
  //           'horsePower': this.horsePowersPremium[this.horsePowersPremium.length - 1]
  //         });
  //       }
  //       this.options = this.horsePowersPremium;
  //     } else {
  //       if (this.psatForm.controls.horsePower.value > 355) {
  //         this.psatForm.patchValue({
  //           'horsePower': this.kWattsPremium[this.kWattsPremium.length - 1]
  //         });
  //       }
  //       this.options = this.kWattsPremium;
  //     }
  //   } else {
  //     if (this.settings.powerMeasurement === 'hp') {
  //       this.options = this.horsePowers;
  //     } else {
  //       this.options = this.kWatts;
  //     }
  //   }
  // }

  getFullLoadAmps() {
    if (!this.disableFLA()) {
      let tmpEfficiency = this.psatService.getEfficiencyFromForm(this.psatForm);
      let estEfficiency = this.psatService.estFLA(
        this.psatForm.controls.horsePower.value,
        this.psatForm.controls.motorRPM.value,
        this.psatForm.controls.frequency.value,
        this.psatForm.controls.efficiencyClass.value,
        tmpEfficiency,
        this.psatForm.controls.motorVoltage.value,
        this.settings
      );
      this.psatForm.patchValue({
        fullLoadAmps: estEfficiency
      });
      this.save();
    }
  }

  disableFLA() {
    if (!this.disableFLAOptimized) {
      if (
        this.psatForm.controls.frequency.status == 'VALID' &&
        this.psatForm.controls.horsePower.status == 'VALID' &&
        this.psatForm.controls.motorRPM.status == 'VALID' &&
        this.psatForm.controls.efficiencyClass.status == 'VALID' &&
        this.psatForm.controls.motorVoltage.status == 'VALID'
      ) {
        if (this.psatForm.controls.efficiencyClass.value != 'Specified') {
          return false;
        } else {
          if (this.psatForm.controls.efficiency.value) {
            return false;
          } else {
            return true;
          }
        }
      }
      else {
        return true;
      }
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

  checkForm(form: FormGroup) {
    this.formValid = this.psatService.isMotorFormValid(form);
    if (this.formValid) {
      this.isValid.emit(true)
    } else {
      this.isInvalid.emit(true)
    }
  }

  defaultRpm() {
    if (this.psatForm.controls.frequency.value == '60 Hz') {
      if (this.psatForm.controls.motorRPM.value == 1485) {
        this.psatForm.patchValue({
          motorRPM: 1780
        })
      }
    } else if (this.psatForm.controls.frequency.value == '50 Hz') {
      if (this.psatForm.controls.motorRPM.value == 1780) {
        this.psatForm.patchValue({
          motorRPM: 1485
        })
      }
    }
  }

  save() {
    this.checkForm(this.psatForm);
    this.psat.inputs = this.psatService.getPsatInputsFromForm(this.psatForm);
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
