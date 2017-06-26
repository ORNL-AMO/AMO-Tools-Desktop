import { Component, OnInit, Input } from '@angular/core';
import { PSAT, Modification } from '../../shared/models/psat';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { PsatService } from '../psat.service';

@Component({
  selector: 'app-explore-opportunities',
  templateUrl: './explore-opportunities.component.html',
  styleUrls: ['./explore-opportunities.component.css']
})
export class ExploreOpportunitiesComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  settings: Settings;

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
  horsePowers: Array<string> = ['5', '7.5', '10', '15', '20', '25', '30', '40', '50', '60', '75', '100', '125', '150', '200', '250', '300', '350', '400', '450', '500', '600', '700', '800', '900', '1000', '1250', '1750', '2000', '2250', '2500', '3000', '3500', '4000', '4500', '5000', '5500', '6000', '7000', '8000', '9000', '10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '22500', '25000', '27500', '30000', '35000', '40000', '45000', '50000'];
  kWatts: Array<string> = ['3', '3.7', '4', '4.5', '5.5', '6', '7.5', '9.2', '11', '13', '15', '18.5', '22', '26', '30', '37', '45', '55', '75', '90', '110', '132', '150', '160', '185', '200', '225', '250', '280', '300', '315', '335', '355', '400', '450', '500', '560', '630', '710', '800', '900', '1000', '1250', '1500', '1750', '2000', '2250', '2500', '3000', '3500', '4000', '4500', '5000', '5500', '6000', '7000', '8000', '9000', '10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '22500', '25000', '27500', '30000', '35000', '40000'];
  options: Array<any>;
  modification: PSAT;
  annualSavings: number;
  optimizationRating: number;
  title: string;
  unit: string;
  titlePlacement: string;
  tmpNewPumpType: string;
  tmpInitialPumpType: string;
  tmpNewEfficiencyClass: string;
  tmpInitialEfficiencyClass: string;
  testVal: string;
  constructor(private psatService: PsatService) { }

  ngOnInit() {
    this.testVal = `mm<sup>2</sup>`;
    if (this.settings.powerMeasurement == 'hp') {
      this.options = this.horsePowers;
    } else {
      this.options = this.kWatts;
    }
    this.modification = JSON.parse(JSON.stringify(this.assessment.psat));
    this.tmpNewEfficiencyClass = this.psatService.getEfficiencyClassFromEnum(this.modification.inputs.efficiency_class);
    this.tmpInitialEfficiencyClass = this.psatService.getEfficiencyClassFromEnum(this.assessment.psat.inputs.efficiency_class);
    this.getPumpType();
    this.calculate();
  }

  calculate() {
    this.assessment.psat.inputs.pump_style = this.psatService.getPumpStyleEnum(this.tmpInitialPumpType);
    this.assessment.psat.inputs.efficiency_class = this.psatService.getEfficienyClassEnum(this.tmpInitialEfficiencyClass);
    this.modification.inputs.pump_style = this.psatService.getPumpStyleEnum(this.tmpNewPumpType);
    this.modification.inputs.efficiency_class = this.psatService.getEfficienyClassEnum(this.tmpNewEfficiencyClass);
    this.modification.outputs = this.psatService.results(this.modification.inputs, this.settings);
    this.assessment.psat.outputs = this.psatService.results(this.assessment.psat.inputs, this.settings);
    this.annualSavings = this.assessment.psat.outputs.existing.annual_cost - this.modification.outputs.existing.annual_cost;
    this.optimizationRating = Number((Math.round(this.modification.outputs.existing.optimization_rating * 100 * 100) / 100).toFixed(0));
    this.title = 'Potential Adjustment Results';
    this.unit = '%';
    this.titlePlacement = 'top';
  }

  getPumpType() {
    this.tmpInitialPumpType = this.psatService.getPumpStyleFromEnum(this.assessment.psat.inputs.pump_style);
    this.tmpNewPumpType = this.psatService.getPumpStyleFromEnum(this.modification.inputs.pump_style);
  }

}
