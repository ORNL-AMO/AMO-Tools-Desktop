import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../psat.service';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-explore-opportunities-form',
  templateUrl: './explore-opportunities-form.component.html',
  styleUrls: ['./explore-opportunities-form.component.css']
})
export class ExploreOpportunitiesFormComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  exploreModIndex: number;
  @Output('changeField')
  changeField = new EventEmitter<string>();

  showSystemData: boolean;
  showRatedMotorData: boolean;
  showPumpData: boolean;

  showCost: boolean;
  showFlowRate: boolean;
  showHead: boolean;

  showRatedMotorPower: boolean;
  showEfficiencyClass: boolean;
  showMotorEfficiency: boolean;

  showOperatingFraction: boolean;
  showPumpType: boolean;
  showMotorDrive: boolean;
  showPumpSpecified: boolean;

  showCalculationMethod: boolean;
  // showViscosity: boolean;
  showSpeed: boolean;
  showSizeMargin: boolean;
  tmpModificationPumpType: string;
  tmpBaselinePumpType: string;
  tmpModificationMotorDrive: string;
  tmpBaselineMotorDrive: string;
  tmpModificationEfficiencyClass: string;
  tmpBaselineEfficiencyClass: string;

  efficiencyClasses: Array<string> = [
    'Standard Efficiency',
    'Energy Efficient',
    // When the user chooses specified, they need a place to put the efficiency value
    'Specified'
  ];

  pumpTypes: Array<string> = [
    'End Suction Slurry',
    'End Suction Sewage',
    'End Suction Stock',
    'End Suction Submersible Sewage',
    'API Double Suction',
    'Multistage Boiler Feed',
    'End Suction ANSI/API',
    'Axial Flow',
    'Double Suction',
    'Vertical Turbine',
    'Large End Suction',
    // When user selects below they need a way to provide the optimal efficiency
    'Specified Optimal Efficiency'
  ];
  drives: Array<string> = [
    'Direct Drive',
    'V-Belt Drive',
    'Notched V-Belt Drive',
    'Synchronous Belt Drive'
  ];
  options: Array<any>;
  horsePowers: Array<string> = ['5', '7.5', '10', '15', '20', '25', '30', '40', '50', '60', '75', '100', '125', '150', '200', '250', '300', '350', '400', '450', '500', '600', '700', '800', '900', '1000', '1250', '1750', '2000', '2250', '2500', '3000', '3500', '4000', '4500', '5000', '5500', '6000', '7000', '8000', '9000', '10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '22500', '25000', '27500', '30000', '35000', '40000', '45000', '50000'];
  kWatts: Array<string> = ['3', '3.7', '4', '4.5', '5.5', '6', '7.5', '9.2', '11', '13', '15', '18.5', '22', '26', '30', '37', '45', '55', '75', '90', '110', '132', '150', '160', '185', '200', '225', '250', '280', '300', '315', '335', '355', '400', '450', '500', '560', '630', '710', '800', '900', '1000', '1250', '1500', '1750', '2000', '2250', '2500', '3000', '3500', '4000', '4500', '5000', '5500', '6000', '7000', '8000', '9000', '10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '22500', '25000', '27500', '30000', '35000', '40000'];

  counter: any;
  rpmError1: string;
  rpmError2: string;
  costError1: string;
  costError2: string;
  flowRateError1: string;
  flowRateError2: string;
  efficiencyError1: string;
  efficiencyError2: string;
  specifiedError1: string;
  specifiedError2: string;
  opFractionError1: string;
  opFractionError2: string;
  ratedPowerError1: string;
  ratedPowerError2: string;

  constructor(private psatService: PsatService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (this.settings.powerMeasurement == 'hp') {
      this.options = this.horsePowers;
    } else {
      this.options = this.kWatts;
    }
    this.tmpModificationEfficiencyClass = this.psatService.getEfficiencyClassFromEnum(this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency_class);
    this.tmpBaselineEfficiencyClass = this.psatService.getEfficiencyClassFromEnum(this.psat.inputs.efficiency_class);
    this.tmpModificationPumpType = this.psatService.getPumpStyleFromEnum(this.psat.modifications[this.exploreModIndex].psat.inputs.pump_style);
    this.tmpBaselinePumpType = this.psatService.getPumpStyleFromEnum(this.psat.inputs.pump_style);
    this.tmpModificationMotorDrive = this.psatService.getDriveFromEnum(this.psat.modifications[this.exploreModIndex].psat.inputs.drive);
    this.tmpBaselineMotorDrive = this.psatService.getDriveFromEnum(this.psat.inputs.drive);
    this.checkMotorEfficiencies();
    this.checkPumpTypes();
    this.checkValues();
    //init error msgs
    this.checkCost(1);
    this.checkCost(2);
    this.checkFlowRate(1);
    this.checkFlowRate(2);
    this.checkOpFraction(1);
    this.checkOpFraction(2);
    this.checkRatedPower(1);
    this.checkRatedPower(2);
    this.checkEfficiency(this.psat.inputs.efficiency, 1);
    this.checkEfficiency(this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency, 2);
    this.checkEfficiency(this.psat.inputs.pump_specified, 3);
    this.checkEfficiency(this.psat.modifications[this.exploreModIndex].psat.inputs.pump_specified, 4);
    this.checkOptimized();
    // this.psat.modifications[this.exploreModIndex].psat.inputs.kinematic_viscosity =  this.psat.inputs.kinematic_viscosity;
  }

  setPumpTypes() {
    this.checkPumpTypes();
    this.psat.inputs.pump_style = this.psatService.getPumpStyleEnum(this.tmpBaselinePumpType);
    this.psat.modifications[this.exploreModIndex].psat.inputs.pump_style = this.psatService.getPumpStyleEnum(this.tmpModificationPumpType);
    this.calculate();
  }

  setMotorDrive() {
    // this.checkPumpTypes();
    // this.psat.inputs.pump_style = this.psatService.getPumpStyleEnum(this.tmpBaselinePumpType);
    // this.psat.modifications[this.exploreModIndex].psat.inputs.pump_style = this.psatService.getPumpStyleEnum(this.tmpModificationPumpType);
    // this.calculate();

    // this.checkMotorDriveTypes();
    this.psat.inputs.drive = this.psatService.getDriveEnum(this.tmpBaselineMotorDrive);
    this.psat.modifications[this.exploreModIndex].psat.inputs.drive = this.psatService.getDriveEnum(this.tmpModificationMotorDrive);
    this.calculate();
  }

  setEfficiencyClasses() {
    this.checkMotorEfficiencies();
    this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency_class = this.psatService.getEfficienyClassEnum(this.tmpModificationEfficiencyClass);
    this.psat.inputs.efficiency_class = this.psatService.getEfficienyClassEnum(this.tmpBaselineEfficiencyClass);
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

  checkPumpTypes() {
    if (this.tmpModificationPumpType == 'Specified Optimal Efficiency') {
      this.showPumpSpecified = true;
    } else {
      this.psat.modifications[this.exploreModIndex].psat.inputs.pump_specified = null;
    }
    if (this.tmpBaselinePumpType == 'Specified Optimal Efficiency') {
      this.showPumpSpecified = true;
    } else {
      this.psat.inputs.pump_specified = null;
    }
    if (this.tmpModificationPumpType != 'Specified Optimal Efficiency' && this.tmpBaselinePumpType != 'Specified Optimal Efficiency') {
      this.showPumpSpecified = false;
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  calculate(str?: string) {
    if (str == 'fixedSpecificSpeed') {
      this.focusField('fixedSpecificSpeed');
    }
    this.startSavePolling();
    this.emitCalculate.emit(true);
  }

  startSavePolling() {
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      this.emitSave.emit(true);
    }, 3000)
  }

  checkValues() {
    if (this.psat.inputs.cost_kw_hour != this.psat.modifications[this.exploreModIndex].psat.inputs.cost_kw_hour) {
      this.showCost = true;
      this.showSystemData = true;
    }
    if (this.psat.inputs.flow_rate != this.psat.modifications[this.exploreModIndex].psat.inputs.flow_rate) {
      this.showFlowRate = true;
      this.showSystemData = true;
    }
    if (this.psat.inputs.head != this.psat.modifications[this.exploreModIndex].psat.inputs.head) {
      this.showHead = true;
      this.showSystemData = true;
    }
    if (this.psat.inputs.motor_rated_power != this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_power) {
      this.showRatedMotorPower = true;
      this.showRatedMotorData = true;
    }
    if (this.psat.inputs.efficiency_class != this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency_class) {
      this.showEfficiencyClass = true;
      this.showRatedMotorData = true;
    }
    if (this.psat.inputs.efficiency != this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency) {
      this.showMotorEfficiency = true;
      this.showSystemData = true;
    }
    if (this.psat.inputs.operating_fraction != this.psat.modifications[this.exploreModIndex].psat.inputs.operating_fraction) {
      this.showOperatingFraction = true;
      this.showPumpData = true;
    }
    if (this.psat.inputs.pump_style != this.psat.modifications[this.exploreModIndex].psat.inputs.pump_style) {
      this.showPumpType = true;
      this.showPumpData = true;
    }
    if (this.psat.inputs.drive !== this.psat.modifications[this.exploreModIndex].psat.inputs.drive) {
      this.showMotorDrive = true;
    }
    if (this.psat.inputs.pump_specified != this.psat.modifications[this.exploreModIndex].psat.inputs.pump_specified) {
      this.showPumpSpecified = true;
      this.showPumpData = true;
    }
    if (this.psat.inputs.optimize_calculation != this.psat.modifications[this.exploreModIndex].psat.inputs.optimize_calculation) {
      this.showCalculationMethod = true;
    }
  }
  checkPumpRpm(num: number) {
    this.calculate();
    let min = 0;
    let max = 0;
    if (this.psat.inputs.drive == this.psatService.getDriveEnum('Direct Drive')) {
      min = 540;
      max = 3960;
    }
    let rpms;
    if (num == 1) {
      rpms = this.psat.inputs.pump_rated_speed;
    } else {
      rpms = this.psat.modifications[this.exploreModIndex].psat.inputs.pump_rated_speed;
    }

    if (rpms < min) {
      if (num == 1) { this.rpmError1 = 'Value is too small. See help panel for assistance.'; }
      else { this.rpmError2 = 'Value is too small. See help panel for assistance.' }
      return false;
    } else if (rpms > max) {
      if (num == 1) { this.rpmError1 = 'Value is too large. See help panel for assistance.'; }
      else { this.rpmError2 = 'Value is too large. See help panel for assistance.' }
      return false;
    } else if (rpms >= min && rpms <= max) {
      if (num == 1) { this.rpmError1 = null }
      else { this.rpmError2 = null }
      return true;
    } else {
      if (num == 1) { this.rpmError1 = null }
      else { this.rpmError2 = null }
      return null;
    }
  }
  checkFlowRate(num: number) {
    this.calculate();
    let tmp: any = {
      message: null,
      valid: null
    };
    if (num == 1) {
      if (this.psat.inputs.flow_rate) {
        tmp = this.psatService.checkFlowRate(this.psat.inputs.pump_style, this.psat.inputs.flow_rate, this.settings);
      } else {
        tmp.message = 'Flow Rate Required';
        tmp.valid = false;
      }
    } else {
      if (this.psat.modifications[this.exploreModIndex].psat.inputs.flow_rate) {
        tmp = this.psatService.checkFlowRate(this.psat.modifications[this.exploreModIndex].psat.inputs.pump_style, this.psat.modifications[this.exploreModIndex].psat.inputs.flow_rate, this.settings);
      } else {
        tmp.message = 'Flow Rate Required';
        tmp.valid = false;
      }
    }

    if (tmp.message) {
      if (num == 1) {
        this.flowRateError1 = tmp.message;
      } else {
        this.flowRateError2 = tmp.message;
      }
    } else {
      if (num == 1) {
        this.flowRateError1 = null;
      } else {
        this.flowRateError2 = null;
      }
    }
    return tmp.valid;
  }
  checkCost(num: number) {
    this.calculate();
    let val;
    if (num == 1) {
      val = this.psat.inputs.cost_kw_hour;
    } else {
      val = this.psat.modifications[this.exploreModIndex].psat.inputs.cost_kw_hour;
    }
    if (val < 0) {
      if (num == 1) {
        this.costError1 = 'Cannot have negative cost';
      } else {
        this.costError2 = 'Cannot have negative cost';
      }
      return false;
    } else if (val > 1) {
      if (num == 1) {
        this.costError1 = "Shouldn't be greater then 1";
      } else {
        this.costError2 = "Shouldn't be greater then 1";
      }
      return false;
    } else if (val >= 0 && val <= 1) {
      if (num == 1) {
        this.costError1 = null;
      } else {
        this.costError2 = null
      }
      return true;
    } else {
      if (num == 1) {
        this.costError1 = null;
      } else {
        this.costError2 = null
      }
      return null;
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
    } else if (num == 3) {
      this.specifiedError1 = str;
    } else if (num == 4) {
      this.specifiedError2 = str;
    }
  }


  checkOpFraction(num: number) {
    this.calculate();
    let val;
    if (num == 1) {
      val = this.psat.inputs.operating_fraction;
    } else if (num == 2) {
      val = this.psat.modifications[this.exploreModIndex].psat.inputs.operating_fraction;
    }
    if (val > 1) {
      if (num == 1) {
        this.opFractionError1 = 'Operating fraction needs to be between 0 - 1';
      } else if (num == 2) {
        this.opFractionError2 = 'Operating fraction needs to be between 0 - 1';
      }
      return false;
    }
    else if (val < 0) {
      if (num == 1) {
        this.opFractionError1 = "Cannot have negative operating fraction";
      } else if (num == 2) {
        this.opFractionError2 = "Cannot have negative operating fraction";
      }
      return false;
    }
    else {
      if (num == 1) {
        this.opFractionError1 = null;
      } else if (num == 2) {
        this.opFractionError2 = null;
      }
      return true;
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

  toggleCost() {
    if (this.showCost == false) {
      this.psat.modifications[this.exploreModIndex].psat.inputs.cost_kw_hour = this.psat.inputs.cost_kw_hour;
      this.calculate();
    }
  }
  toggleFlowRate() {
    if (this.showFlowRate == false) {
      this.psat.modifications[this.exploreModIndex].psat.inputs.flow_rate = this.psat.inputs.flow_rate;
      this.calculate();
    }
  }
  toggleHead() {
    if (this.showHead == false) {
      this.psat.modifications[this.exploreModIndex].psat.inputs.head = this.psat.inputs.head;
      this.calculate();
    }
  }

  toggleSystemData() {
    if (this.showSystemData == false) {
      this.showCost = false;
      this.showFlowRate = false;
      this.showHead = false;
      this.showOperatingFraction = false;
      this.toggleCost();
      this.toggleFlowRate();
      this.toggleHead();
      this.toggleOperatingFraction();
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
      this.calculate();
    }
  }
  toggleMotorEfficiency() {
    if (this.showMotorEfficiency == false) {
      this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency = this.psat.inputs.efficiency;
      this.calculate();
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
  togglePumpData() {
    if (this.showPumpData == false) {
      this.showPumpSpecified = false;
      this.showPumpType = false;
      this.showMotorDrive = false;
      this.togglePumpSpecified();
      this.togglePumpType();
      this.toggleMotorDrive();
    }
  }

  togglePumpSpecified() {
    if (this.showPumpSpecified == false) {
      this.psat.modifications[this.exploreModIndex].psat.inputs.pump_specified = this.psat.inputs.pump_specified;
      this.calculate();
    }
  }
  toggleOperatingFraction() {
    if (this.showOperatingFraction == false) {
      this.psat.modifications[this.exploreModIndex].psat.inputs.operating_fraction = this.psat.inputs.operating_fraction;
      this.calculate();
    }
  }
  togglePumpType() {
    if (this.showPumpType == false) {
      this.psat.modifications[this.exploreModIndex].psat.inputs.pump_style = this.psat.inputs.pump_style;
      this.tmpModificationPumpType = this.psatService.getPumpStyleFromEnum(this.psat.inputs.pump_style);
      this.calculate();
    }
  }
  toggleMotorDrive() {
    if (this.showMotorDrive === false) {
      this.psat.modifications[this.exploreModIndex].psat.inputs.drive = this.psat.inputs.drive;
      this.tmpModificationMotorDrive = this.psatService.getDriveFromEnum(this.psat.inputs.drive);
      this.calculate();
    }
  }
  getUnit(unit: string) {
    let tmpUnit = this.convertUnitsService.getUnit(unit);
    return tmpUnit.unit.name.display;
  }


  //optimized
  addNum() {
    // this.psat.modifications[this.exploreModIndex].psat.inputs.kinematic_viscosity = Number(this.psat.modifications[this.exploreModIndex].psat.inputs.kinematic_viscosity + 1).toFixed(3);
    this.psat.modifications[this.exploreModIndex].psat.inputs.kinematic_viscosity += 1;
    this.calculate();
  }

  subtractNum() {
    if (this.psat.modifications[this.exploreModIndex].psat.inputs.kinematic_viscosity - 1 > 0) {
      // this.psat.modifications[this.exploreModIndex].psat.inputs.kinematic_viscosity = Number(this.psat.modifications[this.exploreModIndex].psat.inputs.kinematic_viscosity - 1).toFixed(3);
      this.psat.modifications[this.exploreModIndex].psat.inputs.kinematic_viscosity -= 1;
    }
    this.calculate();
  }

  toggleOptimized() {
    // this.showViscosity = true;
    this.calculate();
    if (!this.psat.modifications[this.exploreModIndex].psat.inputs.optimize_calculation) {
      // this.psat.modifications[this.exploreModIndex].psat.inputs.kinematic_viscosity =  this.psat.inputs.kinematic_viscosity;
      this.psat.modifications[this.exploreModIndex].psat.inputs.fixed_speed = 0;
      this.psat.modifications[this.exploreModIndex].psat.inputs.margin = 0;
      this.showSpeed = false;
      this.showSizeMargin = false;
    }
  }

  checkOptimized() {
    if (this.psat.modifications[this.exploreModIndex].psat.inputs.optimize_calculation) {
      // this.showViscosity = true;
      // if (this.psat.modifications[this.exploreModIndex].psat.inputs.kinematic_viscosity != 1) {
      //   this.showViscosity = true;
      // }
      if (this.psat.modifications[this.exploreModIndex].psat.inputs.fixed_speed != 0) {
        this.showSpeed = true;
      }
      if (this.psat.modifications[this.exploreModIndex].psat.inputs.margin != 0) {
        this.showSizeMargin = true;
      }
    }
  }

}
