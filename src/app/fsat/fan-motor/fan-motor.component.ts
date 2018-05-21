import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FanMotorService } from './fan-motor.service';
import { PsatService } from '../../psat/psat.service';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FanMotor } from '../../shared/models/fans';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { EfficiencyClasses } from '../fanOptions';
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

  efficiencyClasses: Array<{ value: number, display: string }>
  //   {
  //     value: 0,
  //     display: 'Standard Efficiency'
  //   },
  //   {
  //     value: 1,
  //     display: 'Energy Efficient'
  //   },
  //   {
  //     value: 2,
  //     display: 'Premium'
  //   },
  //   {
  //     value: 3,
  //     display: 'Specified'
  //   }
  // ];


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
  rpmError: string = null;
  voltageError: string = null;
  flaError: string = null;

  efficiencyError: string = null;
  ratedPowerError: string = null;
  disableFLAOptimized: boolean = false;
  fanMotorForm: FormGroup;
  constructor(private fanMotorService: FanMotorService, private psatService: PsatService, private convertUnitsService: ConvertUnitsService, private helpPanelService: HelpPanelService) { }

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
    this.checkForm(this.fanMotorForm);
    // this.helpPanelService.currentField.next('lineFrequency');
    //init alert meessages
    this.modifyPowerArrays();
    this.checkEfficiency(true);
    this.checkFLA(true);
    this.checkMotorRpm(true);
    this.checkMotorVoltage(true);
    this.checkRatedPower(true);
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
  checkForm(form: FormGroup) {
    // this.formValid = this.psatService.isMotorFormValid(form);
    // if (this.formValid) {
    //   this.isValid.emit(true)
    // } else {
    //   this.isInvalid.emit(true)
    // }
  }

  getFullLoadAmps() {
    // if (!this.disableFLA()) {
    //   //TODO: update get efficiency
    //   // let tmpEfficiency = this.psatService.getEfficiencyFromForm(this.fanMotorForm);
    //   let estEfficiency = this.psatService.estFLA(
    //     this.fanMotorForm.controls.motorRatedPower.value,
    //     this.fanMotorForm.controls.motorRpm.value,
    //     this.fanMotorForm.controls.lineFrequency.value,
    //     this.fanMotorForm.controls.efficiencyClass.value,
    //     0,
    //     this.fanMotorForm.controls.motorRatedVoltage.value,
    //     this.settings
    //   );

    //   this.fanMotorForm.patchValue({
    //     fullLoadAmps: estEfficiency
    //   });
    //   this.checkFLA();
    // }
  }
  defaultRpm() {
    if (this.fanMotorForm.controls.lineFrequency.value == '60 Hz') {
      if (this.fanMotorForm.controls.motorRpm.value == 1485) {
        this.fanMotorForm.patchValue({
          motorRPM: 1780
        })
      }
    } else if (this.fanMotorForm.controls.lineFrequency.value == '50 Hz') {
      if (this.fanMotorForm.controls.motorRpm.value == 1780) {
        this.fanMotorForm.patchValue({
          motorRPM: 1485
        })
      }
    }
  }
  disableFLA() {
    if (!this.disableFLAOptimized) {
      if (
        this.fanMotorForm.controls.lineFrequency.status == 'VALID' &&
        this.fanMotorForm.controls.motorRatedPower.status == 'VALID' &&
        this.fanMotorForm.controls.motorRpm.status == 'VALID' &&
        this.fanMotorForm.controls.efficiencyClass.status == 'VALID' &&
        this.fanMotorForm.controls.motorVoltage.status == 'VALID'
      ) {
        if (this.fanMotorForm.controls.efficiencyClass.value != 'Specified') {
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
  checkEfficiency(bool?: boolean) {
    if (!bool) {
      this.save();
    }
    if (this.fanMotorForm.controls.lineFrequency.value > 100) {
      this.efficiencyError = "Unrealistic efficiency, shouldn't be greater then 100%";
      return false;
    }
    else if (this.fanMotorForm.controls.lineFrequency.value == 0) {
      this.efficiencyError = "Cannot have 0% efficiency";
      return false;
    }
    else if (this.fanMotorForm.controls.lineFrequency.value < 0) {
      this.efficiencyError = "Cannot have negative efficiency";
      return false;
    }
    else {
      this.efficiencyError = null;
      return true;
    }
  }
  checkMotorVoltage(bool?: boolean) {
    if (!bool) {
      this.save();
    }
    // if (this.fanMotorForm.controls.motorRatedVoltage.value != '') {
    //   let tmp = this.psatService.checkMotorVoltage(this.fanMotorForm.controls.motorRatedVoltage.value);
    //   if (tmp.message) {
    //     this.voltageError = tmp.message;
    //   } else {
    //     this.voltageError = null;
    //   }
    //   return tmp.valid;
    // }
    // else {
    //   return null;
    // }
    return null;
  }
  checkMotorRpm(bool?: boolean) {
    if (!bool) {
      this.save();
    }
    if (this.fanMotorForm.controls.lineFrequency.value && this.fanMotorForm.controls.motorRpm.value != '') {
      // let frequencyEnum = this.psatService.getLineFreqEnum(this.fanMotorForm.controls.lineFrequency.value);
      // let effClass = this.psatService.getEfficienyClassEnum(this.fanMotorForm.controls.efficiencyClass.value);
      let tmp = this.psatService.checkMotorRpm(this.fanMotorForm.controls.lineFrequency.value, this.fanMotorForm.controls.motorRpm.value, this.fanMotorForm.controls.efficiencyClass.value);
      if (tmp.message) {
        this.rpmError = tmp.message;
      } else {
        this.rpmError = null;
      }
      return tmp.valid;
    } else if (this.fanMotorForm.controls.motorRpm.value == '') {
      this.rpmError = 'Required';
      return false;
    }
    else {
      return null;
    }
  }

  checkRatedPower(bool?: boolean) {
    if (!bool) {
      this.save();
    }
    this.checkFLA();
    let motorFieldPower;
    // if (this.fanMotorForm.controls.loadEstimatedMethod.value == 'Power') {
    //   motorFieldPower = this.fanMotorForm.controls.motorKW.value;
    // } else if (this.fanMotorForm.controls.loadEstimatedMethod.value == 'Current') {
    //   motorFieldPower = this.fanMotorForm.controls.motorAmps.value;
    // }
    if (motorFieldPower && this.fanMotorForm.controls.motorRatedPower.value) {
      let val, compare;
      if (this.settings.powerMeasurement == 'hp') {
        val = this.convertUnitsService.value(this.fanMotorForm.controls.motorRatedPower.value).from(this.settings.powerMeasurement).to('kW');
        compare = this.convertUnitsService.value(motorFieldPower).from(this.settings.powerMeasurement).to('kW');
      } else {
        val = this.fanMotorForm.controls.motorRatedPower.value;
        compare = motorFieldPower;
      }
      val = val * 1.5;
      if (compare > val) {
        this.ratedPowerError = 'The Field Data Motor Power is to high compared to the Rated Motor Power, please adjust the input values.';
        return false
      } else {
        this.ratedPowerError = null;
        return true
      }
    } else {
      return true;
    }
  }

  checkFLA(bool?: boolean) {
    if (!bool) {
      this.save();
    }
    // let tmpEfficiency = this.psatService.getEfficiencyFromForm(this.fanMotorForm);
    // let estEfficiency = this.psatService.estFLA(
    //   this.fanMotorForm.controls.motorRatedPower.value,
    //   this.fanMotorForm.controls.motorRpm.value,
    //   this.fanMotorForm.controls.lineFrequency.value,
    //   this.fanMotorForm.controls.efficiencyClass.value,
    //   this.fanMotorForm.l
    //   this.fanMotorForm.controls.motorRatedVoltage.value,
    //   this.settings
    // );
    // this.psatService.flaRange.flaMax = estEfficiency * 1.05;
    // this.psatService.flaRange.flaMin = estEfficiency * .95;

    // if (this.fanMotorForm.controls.fullLoadAmps.value) {
    //   if ((this.fanMotorForm.controls.fullLoadAmps.value < this.psatService.flaRange.flaMin) || (this.fanMotorForm.controls.fullLoadAmps.value > this.psatService.flaRange.flaMax)) {
    //     this.flaError = 'Value is outside expected range';
    //     return false;
    //   } else {
    //     this.flaError = null;
    //     return true;
    //   }
    // } else {
    //   this.flaError = null;
    //   return true;
    // }
    return true
  }

  changeEfficiencyClass() {
    this.modifyPowerArrays();
    this.checkMotorRpm();
    this.save();
  }

  save() {
    this.fanMotor = this.fanMotorService.getObjFromForm(this.fanMotorForm);
    this.emitSave.emit(this.fanMotor);
  }
}
