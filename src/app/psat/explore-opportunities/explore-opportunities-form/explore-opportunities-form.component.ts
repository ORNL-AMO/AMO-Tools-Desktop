import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../psat.service';
import { Settings } from '../../../shared/models/settings';

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

  showSystemData: string;
  showRatedMotorData: string;
  showPumpData: string;

  showCost: string;
  showFlowRate: string;
  showHead: string;

  showRatedMotorPower: string;
  showEfficiencyClass: string;
  showMotorEfficiency: string;

  showPumpSpeed: string;
  showPumpType: string;
  showPumpSpecified: string;

  tmpNewPumpType: string;
  tmpInitialPumpType: string;
  tmpNewEfficiencyClass: string;
  tmpInitialEfficiencyClass: string;

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
  horsePowers: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000, 50000];
  kWatts: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000];
  options: Array<any>;
  counter: any;

  constructor(private psatService: PsatService) { }

  ngOnInit() {
    if (this.settings.powerMeasurement == 'hp') {
      this.options = this.horsePowers;
    } else {
      this.options = this.kWatts;
    }
    this.tmpNewEfficiencyClass = this.psatService.getEfficiencyClassFromEnum(this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency_class);
    this.tmpInitialEfficiencyClass = this.psatService.getEfficiencyClassFromEnum(this.psat.inputs.efficiency_class);
    this.tmpNewPumpType = this.psatService.getPumpStyleFromEnum(this.psat.modifications[this.exploreModIndex].psat.inputs.pump_style);
    this.tmpInitialPumpType = this.psatService.getPumpStyleFromEnum(this.psat.inputs.pump_style);
    console.log('form '+this.exploreModIndex);
    this.checkValues();
  }

  setPumpTypes() {
    this.psat.inputs.pump_style = this.psatService.getPumpStyleEnum(this.tmpInitialPumpType);
    this.psat.modifications[this.exploreModIndex].psat.inputs.pump_style = this.psatService.getPumpStyleEnum(this.tmpNewPumpType);
    this.calculate();
  }

  setEfficiencyClasses() {
    this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency_class = this.psatService.getEfficienyClassEnum(this.tmpNewEfficiencyClass);
    this.psat.inputs.efficiency_class = this.psatService.getEfficienyClassEnum(this.tmpInitialEfficiencyClass);
    this.calculate();
  }

  calculate() {
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
    // showSystemData: string;
    // showCost: string;
    if (this.psat.inputs.cost_kw_hour != this.psat.modifications[this.exploreModIndex].psat.inputs.cost_kw_hour) {
      this.showCost = 'true';
      this.showSystemData = 'true';
    }
    // showFlowRate: string;
    if (this.psat.inputs.flow_rate != this.psat.modifications[this.exploreModIndex].psat.inputs.flow_rate) {
      this.showFlowRate = 'true';
      this.showSystemData = 'true';
    }
    // showHead: string;
    if (this.psat.inputs.head != this.psat.modifications[this.exploreModIndex].psat.inputs.head) {
      this.showHead = 'true';
      this.showSystemData = 'true';
    }

    // showRatedMotorData: string;
    // showRatedMotorPower: string;
    if (this.psat.inputs.motor_rated_power != this.psat.modifications[this.exploreModIndex].psat.inputs.motor_rated_power) {
      this.showRatedMotorPower = 'true';
      this.showRatedMotorData = 'true';
    }
    // showEfficiencyClass: string;
    if (this.psat.inputs.efficiency_class != this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency_class) {
      this.showEfficiencyClass = 'true';
      this.showRatedMotorData = 'true';
    }
    // showMotorEfficiency: string;
    if (this.psat.inputs.efficiency != this.psat.modifications[this.exploreModIndex].psat.inputs.efficiency) {
      this.showMotorEfficiency = 'true';
      this.showRatedMotorData = 'true';
    }
    // showPumpData: string;
    // showPumpSpeed: string;
    if (this.psat.inputs.pump_rated_speed != this.psat.modifications[this.exploreModIndex].psat.inputs.pump_rated_speed) {
      this.showPumpSpeed = 'true';
      this.showPumpData = 'true';
    }
    // showPumpType: string;
    if (this.psat.inputs.pump_style != this.psat.modifications[this.exploreModIndex].psat.inputs.pump_style) {
      this.showPumpType = 'true';
      this.showPumpData = 'true';
    }
    // showPumpSpecified: string;
    if (this.psat.inputs.pump_specified != this.psat.modifications[this.exploreModIndex].psat.inputs.pump_specified) {
      this.showPumpSpecified = 'true';
      this.showPumpData = 'true';
    }
  }
}
