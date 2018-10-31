import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PSAT } from '../../../../shared/models/psat';
import { PsatService } from '../../../psat.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { PsatWarningService, MotorWarnings } from '../../../psat-warning.service';
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
  showFLA: boolean = false;
  ratedPowerError1: string = null;
  ratedPowerError2: string = null;
  efficiencyError1: string = null;
  efficiencyError2: string = null;
  flaError1: string = null;
  flaError2: string = null;
  tmpModificationEfficiencyClass: string;
  tmpBaselineEfficiencyClass: string;
  // options: Array<any>;
  // options2: Array<any>;
  // horsePowers: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000, 50000];
  // horsePowersPremium: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500];
  // kWatts: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000];
  // kWattsPremium: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355];
  efficiencyClasses: Array<string> = [
    'Standard Efficiency',
    'Energy Efficient',
    'Premium Efficient',
    // When the user chooses specified, they need a place to put the efficiency value
    'Specified'
  ];
  constructor(private psatService: PsatService, private convertUnitsService: ConvertUnitsService, private psatWarningService: PsatWarningService) { }

  ngOnInit() {
    // if (this.settings.powerMeasurement == 'hp') {
    //   this.options = this.horsePowers;
    // } else {
    //   this.options = this.kWatts;
    // }
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
    this.tmpBaselineEfficiencyClass = this.psatService.getEfficiencyClassFromEnum(this.psat.inputs.efficiency_class);
    this.tmpModificationEfficiencyClass = this.psatService.getEfficiencyClassFromEnum(this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency_class);
    this.initEfficiencyClass();
    this.initMotorEfficiency();
    this.initRatedMotorPower();
    this.initFLA();
    this.initRatedMotorData();
    this.checkWarnings();
  }

  initEfficiencyClass() {
    if (this.tmpBaselineEfficiencyClass != this.tmpModificationEfficiencyClass) {
      this.showEfficiencyClass = true;
    } else {
      this.showEfficiencyClass = false;
    }
  }

  initMotorEfficiency() {
    if (this.psat.inputs.efficiency != this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency) {
      this.showMotorEfficiency = true;
    } else {
      this.showMotorEfficiency = false;
    }
  }

  initRatedMotorPower() {
    if (this.psat.inputs.motor_rated_power != this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_power) {
      this.showRatedMotorPower = true;
    } else {
      this.showRatedMotorPower = false;
    }
  }

  initRatedMotorData() {
    if (this.showEfficiencyClass || this.showMotorEfficiency || this.showRatedMotorPower || this.showFLA) {
      this.showRatedMotorData = true;
    } else {
      this.showRatedMotorData = false;
    }
  }

  initFLA() {
    if (this.psat.inputs.motor_rated_fla != this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_fla) {
      this.showFLA = true;
    } else {
      this.showFLA = false;
    }
  }


  calculate() {
    this.checkWarnings();
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

  checkWarnings() {
    let baselineWarnings: MotorWarnings = this.psatWarningService.checkMotorWarnings(this.psat, this.settings);
    // this.efficiencyError1 = baselineWarnings.efficiencyError;
    this.ratedPowerError1 = baselineWarnings.ratedPowerError;
    this.flaError1 = baselineWarnings.flaError;
    let modifiedWarnings: MotorWarnings = this.psatWarningService.checkMotorWarnings(this.psat.modifications[this.exploreModIndex].psat, this.settings);
    // this.efficiencyError2 = modifiedWarnings.efficiencyError;
    this.ratedPowerError2 = modifiedWarnings.ratedPowerError;
    this.flaError2 = modifiedWarnings.flaError;
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

  toggleRatedMotorData() {
    if (this.showRatedMotorData == false) {
      this.showRatedMotorPower = false;
      this.showEfficiencyClass = false;
      this.showMotorEfficiency = false;
      this.toggleMotorEfficiency();
      this.toggleEfficiencyClass();
      this.toggleMotorRatedPower();
      this.toggleFLA();
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
      // this.modifyPowerArrays(false);
      this.calculate();
    }
  }
  toggleMotorEfficiency() {
    if (this.showMotorEfficiency == false) {
      this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency = this.psat.inputs.efficiency;
      this.calculate();
    }
  }

  toggleFLA() {
    if (this.showFLA == false) {
      this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_fla = this.psat.inputs.motor_rated_fla;
      this.calculate();
    }
  }

  disableModifiedFLA() {
    let lineFreqTest: boolean = (this.psat.modifications[this.exploreModIndex].psat.inputs.line_frequency != undefined || this.psat.modifications[this.exploreModIndex].psat.inputs.line_frequency != null);
    if (
      this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_power &&
      this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_speed &&
      lineFreqTest &&
      this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency_class &&
      this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency &&
      this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_voltage
    ) {
      return false;
    } else {
      return true;
    }
  }

  getModificationFLA() {
    if (!this.disableModifiedFLA()) {
      let estEfficiency = this.psatService.estFLA(
        this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_power,
        this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_speed,
        this.psat.modifications[this.exploreModIndex].psat.inputs.line_frequency,
        this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency_class,
        this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency,
        this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_voltage,
        this.settings
      );
      this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_fla = estEfficiency;
    }
    this.calculate();
  }

}
