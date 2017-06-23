import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../shared/models/psat';
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-explore-opportunities',
  templateUrl: './explore-opportunities.component.html',
  styleUrls: ['./explore-opportunities.component.css']
})
export class ExploreOpportunitiesComponent implements OnInit {
  @Input()
  assessment: Assessment;

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
  showSpecifiedPumpEfficiency: string;

  efficiencyClasses: Array<string> = [
    'Standard Efficiency',
    'Energy Efficient',
    // When the user chooses specified, they need a place to put the efficiency value
    'Specified'
  ];

  constructor() { }

  ngOnInit() {
  }

}
