import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT } from '../../../../shared/models/fans';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { EfficiencyClasses } from '../../../fanOptions';
import { HelpPanelService } from '../../../help-panel/help-panel.service';
import { ModifyConditionsService } from '../../../modify-conditions/modify-conditions.service';
import { FsatWarningService, FanMotorWarnings } from '../../../fsat-warning.service';

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

  showRatedMotorPower: boolean = false;
  showEfficiencyClass: boolean = false;
  showRatedMotorData: boolean = false;
  showMotorEfficiency: boolean = false;

  baselineWarnings: FanMotorWarnings;
  modificationWarnings: FanMotorWarnings;
  options: Array<any>;
  options2: Array<any>;
  horsePowers: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000, 50000];
  horsePowersPremium: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500];
  kWatts: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000];
  kWattsPremium: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355];

  efficiencyClasses: Array<{ value: number, display: string }>
  constructor(private fsatWarningService: FsatWarningService, private convertUnitsService: ConvertUnitsService, private helpPanelService: HelpPanelService, private modifyConditionsService: ModifyConditionsService) { }

  ngOnInit() {
    this.efficiencyClasses = EfficiencyClasses;
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
    this.modifyPowerArrays(true);
    this.modifyPowerArrays(false);
    this.initEfficiencyClass();
    this.initMotorEfficiency();
    this.initRatedMotorPower();
    this.initRatedMotorData();
    this.checkWarnings();
  }

  modifyPowerArrays(isBaseline: boolean) {
    if (isBaseline) {
      if (this.fsat.fanMotor.efficiencyClass === 2) {
        if (this.settings.powerMeasurement === 'hp') {
          if (this.fsat.fanMotor.motorRatedPower > 500) {
            this.fsat.fanMotor.motorRatedPower = this.horsePowersPremium[this.horsePowersPremium.length - 1];
          }
          this.options = this.horsePowersPremium;
        } else {
          if (this.fsat.fanMotor.motorRatedPower > 355) {
            this.fsat.fanMotor.motorRatedPower = this.kWattsPremium[this.kWattsPremium.length - 1];
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
      if (this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.efficiencyClass === 2) {
        if (this.settings.powerMeasurement === 'hp') {
          if (this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.motorRatedPower > 500) {
            this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.motorRatedPower = this.horsePowersPremium[this.horsePowersPremium.length - 1];
          }
          this.options2 = this.horsePowersPremium;
        } else {
          if (this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.motorRatedPower > 355) {
            this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.motorRatedPower = this.kWattsPremium[this.kWattsPremium.length - 1];
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
    if (this.fsat.fanMotor.efficiencyClass != this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.efficiencyClass) {
      this.showEfficiencyClass = true;
    } else {
      this.showEfficiencyClass = false;
    }
  }

  initMotorEfficiency() {
    if (this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.efficiencyClass == 3) {
      this.showMotorEfficiency = true;
    } else {
      this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.specifiedEfficiency = null;
    }
    if (this.fsat.fanMotor.efficiencyClass == 3) {
      this.showMotorEfficiency = true;
    } else {
      this.fsat.fanMotor.specifiedEfficiency = null;
    }
    if (this.fsat.fanMotor.efficiencyClass != 3 && this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.efficiencyClass != 3) {
      this.showMotorEfficiency = false;
    }
  }

  initRatedMotorPower() {
    if (this.fsat.fanMotor.motorRatedPower != this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.motorRatedPower) {
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
    this.checkWarnings();
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
    this.modifyConditionsService.modifyConditionsTab.next('fan-motor')
  }
  
  getUnit(unit: string) {
    let tmpUnit = this.convertUnitsService.getUnit(unit);
    let dsp = tmpUnit.unit.name.display.replace('(', '');
    dsp = dsp.replace(')', '');
    return dsp;

  }

  setEfficiencyClasses() {
    this.initMotorEfficiency();
    if (!this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.specifiedEfficiency) {
      this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.specifiedEfficiency = 90;
    }
    if (!this.fsat.fanMotor.specifiedEfficiency) {
      this.fsat.fanMotor.specifiedEfficiency = 90;
    }
    this.modifyPowerArrays(true);
    this.modifyPowerArrays(false);
    this.calculate();
  }

  checkWarnings(){
    this.baselineWarnings = this.fsatWarningService.checkMotorWarnings(this.fsat, this.settings);
    this.modificationWarnings = this.fsatWarningService.checkMotorWarnings(this.fsat.modifications[this.exploreModIndex].fsat, this.settings);
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
      this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.motorRatedPower = this.fsat.fanMotor.motorRatedPower;
      this.calculate();
    }
  }
  toggleEfficiencyClass() {
    if (this.showEfficiencyClass == false) {
      this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.efficiencyClass = this.fsat.fanMotor.efficiencyClass;
      this.modifyPowerArrays(false);
      this.calculate();
    }
  }
  toggleMotorEfficiency() {
    if (this.showMotorEfficiency == false) {
      this.fsat.modifications[this.exploreModIndex].fsat.fanMotor.specifiedEfficiency = this.fsat.fanMotor.specifiedEfficiency;
      this.calculate();
    }
  }
}
