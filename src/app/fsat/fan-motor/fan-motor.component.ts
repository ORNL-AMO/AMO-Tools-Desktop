import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FanMotorService } from './fan-motor.service';
import { PsatService } from '../../psat/psat.service';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FanMotor, FieldData, FSAT } from '../../shared/models/fans';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { EfficiencyClasses } from '../fanOptions';
import { CompareService } from '../compare.service';
import { FanMotorWarnings, FsatWarningService } from '../fsat-warning.service';
@Component({
  selector: 'app-fan-motor',
  templateUrl: './fan-motor.component.html',
  styleUrls: ['./fan-motor.component.css']
})
export class FanMotorComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  selected: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  fanMotor: FanMotor;
  @Input()
  modificationIndex: number;
  @Output('emitSave')
  emitSave = new EventEmitter<FanMotor>();
  @Input()
  fieldData: FieldData;
  @Input()
  fsat: FSAT;

  efficiencyClasses: Array<{ value: number, display: string }>

  horsePowers: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000, 50000];
  horsePowersPremium: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500];
  kWatts: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000];
  kWattsPremium: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355];

  frequencies: Array<number> = [
    50,
    60
  ];

  options: Array<any>;
  counter: any;
  isFirstChange: boolean = true;
  formValid: boolean;
  warnings: FanMotorWarnings;
  disableFLAOptimized: boolean = false;
  fanMotorForm: FormGroup;
  constructor(private compareService: CompareService, private fanMotorService: FanMotorService, private psatService: PsatService, private convertUnitsService: ConvertUnitsService, private helpPanelService: HelpPanelService, private fsatWarningService: FsatWarningService) { }

  ngOnInit() {
    this.efficiencyClasses = EfficiencyClasses;
    this.init();
    if (this.settings.powerMeasurement == 'hp') {
      this.options = this.horsePowers;
    } else {
      this.options = this.kWatts;
    }
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

  disableForm() {
    this.fanMotorForm.controls.lineFrequency.disable();
    this.fanMotorForm.controls.motorRatedPower.disable();
    this.fanMotorForm.controls.efficiencyClass.disable();
  }

  enableForm() {
    this.fanMotorForm.controls.lineFrequency.enable();
    this.fanMotorForm.controls.motorRatedPower.enable();
    this.fanMotorForm.controls.efficiencyClass.enable();
  }
  init() {
    this.fanMotorForm = this.fanMotorService.getFormFromObj(this.fanMotor)
    // this.helpPanelService.currentField.next('lineFrequency');
    //init alert meessages
    this.modifyPowerArrays();
    this.checkWarnings();
  }

  changeLineFreq() {
    this.defaultRpm();
    this.save();
  }
  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
  }
  modifyPowerArrays() {
    if (this.fanMotorForm.controls.efficiencyClass.value === 'Premium') {
      if (this.settings.powerMeasurement === 'hp') {
        if (this.fanMotorForm.controls.motorRatedPower.value > 500) {
          this.fanMotorForm.patchValue({
            'motorRatedPower': this.horsePowersPremium[this.horsePowersPremium.length - 1]
          });
        }
        this.options = this.horsePowersPremium;
      } else {
        if (this.fanMotorForm.controls.motorRatedPower.value > 355) {
          this.fanMotorForm.patchValue({
            'motorRatedPower': this.kWattsPremium[this.kWattsPremium.length - 1]
          });
        }
        this.options = this.kWattsPremium;
      }
    } else {
      if (this.settings.powerMeasurement === 'hp') {
        this.options = this.horsePowers;
      } else {
        this.options = this.kWatts;
      }
    }
  }

  checkWarnings() {
    this.warnings = this.fsatWarningService.checkMotorWarnings(this.fsat, this.settings);
  }

  calcFla(): number {
    if (!this.disableFLA()) {
      let tmpEfficiency: number;
      //use efficiency class value if not specified efficiency class for efficiency
      if (this.fanMotorForm.controls.efficiencyClass.value != 3) {
        tmpEfficiency = this.fanMotorForm.controls.efficiencyClass.value;
      } else {
        tmpEfficiency = this.fanMotorForm.controls.specifiedEfficiency.value;
      }
      //estFLA method needs: 
      //lineFrequency as a string with Hz appended to value
      //efficiencyClass as the string name value
      let estEfficiency = this.psatService.estFLA(
        this.fanMotorForm.controls.motorRatedPower.value,
        this.fanMotorForm.controls.motorRpm.value,
        this.fanMotorForm.controls.lineFrequency.value + ' Hz',
        this.psatService.getEfficiencyClassFromEnum(this.fanMotorForm.controls.efficiencyClass.value),
        tmpEfficiency,
        this.fanMotorForm.controls.motorRatedVoltage.value,
        this.settings
      );
      return estEfficiency;
    } else {
      return null
    }
  }

  getFullLoadAmps() {
    if (!this.disableFLA()) {
      this.fanMotorForm.patchValue({
        fullLoadAmps: this.calcFla()
      });
      this.save();
    }
  }
  defaultRpm() {
    if (this.fanMotorForm.controls.lineFrequency.value == 60) {
      if (this.fanMotorForm.controls.motorRpm.value == 1485) {
        this.fanMotorForm.patchValue({
          motorRPM: 1780
        })
      }
    } else if (this.fanMotorForm.controls.lineFrequency.value == 50) {
      if (this.fanMotorForm.controls.motorRpm.value == 1780) {
        this.fanMotorForm.patchValue({
          motorRPM: 1485
        })
      }
    }
  }
  disableFLA(): boolean {
    if (!this.disableFLAOptimized) {
      if (
        this.fanMotorForm.controls.lineFrequency.status == 'VALID' &&
        this.fanMotorForm.controls.motorRatedPower.status == 'VALID' &&
        this.fanMotorForm.controls.motorRpm.status == 'VALID' &&
        this.fanMotorForm.controls.efficiencyClass.status == 'VALID' &&
        this.fanMotorForm.controls.motorRatedVoltage.status == 'VALID'
      ) {
        if (this.fanMotorForm.controls.efficiencyClass.value != 3) {
          return false;
        } else {
          if (this.fanMotorForm.controls.lineFrequency.value) {
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

  changeEfficiencyClass() {
    this.modifyPowerArrays();
    this.save();
  }

  save() {
    this.fanMotor = this.fanMotorService.getObjFromForm(this.fanMotorForm);
    this.emitSave.emit(this.fanMotor);
    this.checkWarnings();
  }

  canCompare() {
    if (this.compareService.baselineFSAT && this.compareService.modifiedFSAT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  isLineFrequencyDifferent() {
    if (this.canCompare()) {
      return this.compareService.isLineFrequencyDifferent();
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
  isMotorRpmDifferent() {
    if (this.canCompare()) {
      return this.compareService.isMotorRpmDifferent();
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
  isSpecifiedEfficiencyDifferent() {
    if (this.canCompare()) {
      return this.compareService.isSpecifiedEfficiencyDifferent();
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
  isMotorFullLoadAmpsDifferent() {
    if (this.canCompare()) {
      return this.compareService.isMotorFullLoadAmpsDifferent();
    } else {
      return false;
    }
  }
}
