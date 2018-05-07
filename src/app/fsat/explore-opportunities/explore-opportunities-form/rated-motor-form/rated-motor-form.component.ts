import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT } from '../../../../shared/models/fans';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { PsatService } from '../../../../psat/psat.service';


@Component({
  selector: 'app-rated-motor-form',
  templateUrl: './rated-motor-form.component.html',
  styleUrls: ['./rated-motor-form.component.css']
})
export class RatedMotorFormComponent implements OnInit {
  @Input()
  fsat: FSAT;
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();

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
  constructor(private psatService: PsatService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (this.settings.powerMeasurement == 'hp') {
      this.options = this.horsePowers;
      this.options2 = this.horsePowers;
    } else {
      this.options = this.kWatts;
      this.options2 = this.kWatts;
    }
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
    // this.tmpBaselineEfficiencyClass = this.psatService.getEfficiencyClassFromEnum(this.fsat.fanMotor.efficiency_class);
    // this.tmpModificationEfficiencyClass = this.psatService.getEfficiencyClassFromEnum(this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.efficiency_class);
    this.modifyPowerArrays(true);
    this.modifyPowerArrays(false);
    this.initEfficiencyClass();
    this.initMotorEfficiency();
    this.initRatedMotorPower();
    this.initRatedMotorData();
  }

  modifyPowerArrays(isBaseline: boolean) {
    // if (isBaseline) {
    //   if (this.fsat.fanMotor.efficiency_class === this.psatService.getEfficienyClassEnum('Premium')) {
    //     if (this.settings.powerMeasurement === 'hp') {
    //       if (this.fsat.fanMotor.horsePower > 500) {
    //         this.fsat.fanMotor.horsePower = this.horsePowersPremium[this.horsePowersPremium.length - 1];
    //       }
    //       this.options = this.horsePowersPremium;
    //     } else {
    //       if (this.fsat.fanMotor.horsePower > 355) {
    //         this.fsat.fanMotor.horsePower = this.kWattsPremium[this.kWattsPremium.length - 1];
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
    // } else {
    //   if (this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.efficiency_class === this.psatService.getEfficienyClassEnum('Premium')) {
    //     if (this.settings.powerMeasurement === 'hp') {
    //       if (this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.horsePower > 500) {
    //         this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.horsePower = this.horsePowersPremium[this.horsePowersPremium.length - 1];
    //       }
    //       this.options2 = this.horsePowersPremium;
    //     } else {
    //       if (this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.horsePower > 355) {
    //         this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.horsePower = this.kWattsPremium[this.kWattsPremium.length - 1];
    //       }
    //       this.options2 = this.kWattsPremium;
    //     }
    //   } else {
    //     if (this.settings.powerMeasurement === 'hp') {
    //       this.options2 = this.horsePowers;
    //     } else {
    //       this.options2 = this.kWatts;
    //     }
    //   }
    // }
  }

  initEfficiencyClass() {
    if (this.tmpBaselineEfficiencyClass != this.tmpModificationEfficiencyClass) {
      this.showEfficiencyClass = true;
    } else {
      this.showEfficiencyClass = false;
    }
  }

  initMotorEfficiency() {
    if (this.fsat.fanMotor.efficiency != this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.efficiency) {
      this.showMotorEfficiency = true;
    } else {
      this.showMotorEfficiency = false;
    }
  }

  initRatedMotorPower() {
    if (this.fsat.fanMotor.horsePower != this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.horsePower) {
      this.showRatedMotorPower = true;
    } else {
      this.showRatedMotorPower = false;
    }
  }

  initRatedMotorData() {
    if (this.showEfficiencyClass || this.showMotorEfficiency || this.showRatedMotorPower) {
      this.showRatedMotorData = true;
    } else {
      this.showRatedMotorData = false;
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
    // this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.efficiencyClass = this.psatService.getEfficienyClassEnum(this.tmpModificationEfficiencyClass);
    // this.fsat.fanMotor.efficiencyClass = this.psatService.getEfficienyClassEnum(this.tmpBaselineEfficiencyClass);
    // if (!this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.efficiency) {
    //   this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.efficiency = 90;
    // }
    // if (!this.fsat.fanMotor.efficiency) {
    //   this.fsat.fanMotor.efficiency = 90;
    // }
    // this.modifyPowerArrays(true);
    // this.modifyPowerArrays(false);
    this.calculate();
  }

  checkMotorEfficiencies() {
    if (this.tmpModificationEfficiencyClass == 'Specified') {
      this.showMotorEfficiency = true;
    } else {
      this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.efficiency = null;
    }
    if (this.tmpBaselineEfficiencyClass == 'Specified') {
      this.showMotorEfficiency = true;
    } else {
      this.fsat.fanMotor.efficiency = null;
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
        val = this.convertUnitsService.value(this.fsat.fanMotor.horsePower).from(this.settings.powerMeasurement).to('kW');
      } else {
        val = this.fsat.fanMotor.horsePower;
      }
      val = val * 1.5;
    } else if (num == 2) {
      if (this.settings.powerMeasurement == 'hp') {
        val = this.convertUnitsService.value(this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.horsePower).from(this.settings.powerMeasurement).to('kW');
      } else {
        val = this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.horsePower;
      }
      val = val * 1.5;
    }
    let compareVal = this.fsat.fanMotor.horsePower;
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
      this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.horsePower = this.fsat.fanMotor.horsePower;
      this.calculate();
    }
  }
  toggleEfficiencyClass() {
    if (this.showEfficiencyClass == false) {
      this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.efficiencyClass = this.fsat.fanMotor.efficiencyClass;
     // this.tmpModificationEfficiencyClass = this.psatService.getEfficiencyClassFromEnum(this.fsat.fanMotor.efficiencyClass);
      this.modifyPowerArrays(false);
      this.calculate();
    }
  }
  toggleMotorEfficiency() {
    if (this.showMotorEfficiency == false) {
      this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.efficiency = this.fsat.fanMotor.efficiency;
      this.calculate();
    }
  }
}
