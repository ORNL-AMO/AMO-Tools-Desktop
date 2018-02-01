import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PSAT } from '../../../../shared/models/psat';
import { PsatService } from '../../../psat.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-rated-motor-form',
  templateUrl: './rated-motor-form.component.html',
  styleUrls: ['./rated-motor-form.component.css']
})
export class RatedMotorFormComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;

  showRatedMotorPower: boolean = false;
  showEfficiencyClass: boolean = false;
  showRatedMotorData: boolean = false;
  showMotorEfficiency: boolean = false;

  ratedPowerError1: string = null;
  ratedPowerError2: string = null;
  efficiencyError1: string = null;
  efficiencyError2: string = null;
  tmpModificationEfficiencyClass: string;
  tmpBaselineEfficiencyClass: string;
  options: Array<any>;
  options2: Array<any>;
  horsePowers: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000, 50000];
  horsePowersPremium: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500];
  kWatts: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000];
  kWattsPremium: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355];
  efficiencyClasses: Array<string> = [
    'Standard Efficiency',
    'Energy Efficient',
    'Premium',
    // When the user chooses specified, they need a place to put the efficiency value
    'Specified'
  ];
  constructor(private psatService: PsatService, private convertUnitsService: ConvertUnitsService) {}

  ngOnInit() {
    if (this.settings.powerMeasurement == 'hp') {
      this.options = this.horsePowers;
    } else {
      this.options = this.kWatts;
    }
    this.tmpBaselineEfficiencyClass = this.psatService.getEfficiencyClassFromEnum(this.psat.inputs.efficiency_class);
    this.tmpModificationEfficiencyClass = this.psatService.getEfficiencyClassFromEnum(this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency_class);
    this.modifyPowerArrays(true);
    this.modifyPowerArrays(false);
    this.initEfficiencyClass();
    this.initMotorEfficiency();
    this.initRatedMotorPower();
    this.initRatedMotorData();
  }

  modifyPowerArrays(isBaseline: boolean) {
    if (isBaseline) {
      if (this.psat.inputs.efficiency_class === this.psatService.getEfficienyClassEnum('Premium')) {
        if (this.settings.powerMeasurement === 'hp') {
          if (this.psat.inputs.motor_rated_power > 500) {
            this.psat.inputs.motor_rated_power = this.horsePowersPremium[this.horsePowersPremium.length - 1];
          }
          this.options = this.horsePowersPremium;
        } else {
          if (this.psat.inputs.motor_rated_power > 355) {
            this.psat.inputs.motor_rated_power = this.kWattsPremium[this.kWattsPremium.length - 1];
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
    } else {
      if (this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency_class === this.psatService.getEfficienyClassEnum('Premium')) {
        if (this.settings.powerMeasurement === 'hp') {
          if (this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_power > 500) {
            this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_power = this.horsePowersPremium[this.horsePowersPremium.length - 1];
          }
          this.options2 = this.horsePowersPremium;
        } else {
          if (this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_power > 355) {
            this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_power = this.kWattsPremium[this.kWattsPremium.length - 1];
          }
          this.options2 = this.kWattsPremium;
        }
      } else {
        if (this.settings.powerMeasurement === 'hp') {
          this.options2 = this.horsePowers;
        } else {
          this.options2 = this.kWatts;
        }
      }
    }
  }

  initEfficiencyClass() {
    if (this.tmpBaselineEfficiencyClass != this.tmpModificationEfficiencyClass) {
      this.showEfficiencyClass = true;
    }
  }

  initMotorEfficiency() {
    if (this.psat.inputs.efficiency != this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency) {
      this.showMotorEfficiency = true;
    }
  }

  initRatedMotorPower() {
    if (this.psat.inputs.motor_rated_power != this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_power) {
      this.showRatedMotorPower = true;
    }
  }

  initRatedMotorData() {
    if (this.showEfficiencyClass || this.showMotorEfficiency || this.showRatedMotorPower) {
      this.showRatedMotorData = true;
    }
  }


  calculate() {
    this.emitCalculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  getUnit(unit: string) {
    let tmpUnit = this.convertUnitsService.getUnit(unit);
    let dsp = tmpUnit.unit.name.display.replace('(', '');
    dsp = dsp.replace(')', '');
    return dsp;

  }

  setEfficiencyClasses() {
    this.checkMotorEfficiencies();
    this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency_class = this.psatService.getEfficienyClassEnum(this.tmpModificationEfficiencyClass);
    this.psat.inputs.efficiency_class = this.psatService.getEfficienyClassEnum(this.tmpBaselineEfficiencyClass);
    if (!this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency) {
      this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency = 90;
    }
    if (!this.psat.inputs.efficiency) {
      this.psat.inputs.efficiency = 90;
    }
    this.modifyPowerArrays(true);
    this.modifyPowerArrays(false);
    this.calculate();
  }

  checkMotorEfficiencies() {
    if (this.tmpModificationEfficiencyClass == 'Specified') {
      this.showMotorEfficiency = true;
    } else {
      this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency = null;
    }
    if (this.tmpBaselineEfficiencyClass == 'Specified') {
      this.showMotorEfficiency = true;
    } else {
      this.psat.inputs.efficiency = null;
    }
    if (this.tmpBaselineEfficiencyClass != 'Specified' && this.tmpModificationEfficiencyClass != 'Specified') {
      this.showMotorEfficiency = false;
    }
  }

  checkEfficiency(val: number, num: number) {
    this.calculate();
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
    if (num == 1) {
      this.efficiencyError1 = str;
    } else if (num == 2) {
      this.efficiencyError2 = str;
    }
  }

  checkRatedPower(num: number) {
    this.calculate();
    let val;
    if (num == 1) {
      if (this.settings.powerMeasurement == 'hp') {
        val = this.convertUnitsService.value(this.psat.inputs.motor_rated_power).from(this.settings.powerMeasurement).to('kW');
      } else {
        val = this.psat.inputs.motor_rated_power;
      }
      val = val * 1.5;
    } else if (num == 2) {
      if (this.settings.powerMeasurement == 'hp') {
        val = this.convertUnitsService.value(this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_power).from(this.settings.powerMeasurement).to('kW');
      } else {
        val = this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_power;
      }
      val = val * 1.5;
    }
    let compareVal = this.psat.inputs.motor_field_power;
    if (compareVal > val) {
      if (num == 1) {
        this.ratedPowerError1 = 'The Field Data Motor Power is too high compared to the Rated Motor Power, please adjust the input values.';
      } else if (num == 2) {
        this.ratedPowerError2 = 'The Field Data Motor Power is too high compared to the Rated Motor Power, please adjust the input values.';
      }
      return false;
    } else {
      if (num == 1) {
        this.ratedPowerError1 = null;
      } else if (num == 2) {
        this.ratedPowerError2 = null;
      }
      return true
    }
  }
  toggleRatedMotorData() {
    if (this.showRatedMotorData == false) {
      this.showRatedMotorPower = false;
      this.showEfficiencyClass = false;
      this.showMotorEfficiency = false;
      this.toggleMotorEfficiency();
      this.toggleEfficiencyClass();
      this.toggleMotorRatedPower();
    }
  }
  toggleMotorRatedPower() {
    if (this.showRatedMotorPower == false) {
      this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_power = this.psat.inputs.motor_rated_power;
      this.calculate();
    }
  }
  toggleEfficiencyClass() {
    if (this.showEfficiencyClass == false) {
      this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency_class = this.psat.inputs.efficiency_class;
      this.tmpModificationEfficiencyClass = this.psatService.getEfficiencyClassFromEnum(this.psat.inputs.efficiency_class);
      this.modifyPowerArrays(false);
      this.calculate();
    }
  }
  toggleMotorEfficiency() {
    if (this.showMotorEfficiency == false) {
      this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency = this.psat.inputs.efficiency;
      this.calculate();
    }
  }
}
