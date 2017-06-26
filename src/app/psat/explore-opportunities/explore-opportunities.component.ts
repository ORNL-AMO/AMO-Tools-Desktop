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
  showSpecifiedPumpEfficiency: string;

  efficiencyClasses: Array<string> = [
    'Standard Efficiency',
    'Energy Efficient',
    // When the user chooses specified, they need a place to put the efficiency value
    'Specified'
  ];

  modification: PSAT;
  
  constructor(private psatService: PsatService) { }

  ngOnInit() {
    this.modification = JSON.parse(JSON.stringify(this.assessment.psat));
    this.calculate();
  }

  calculate(){
      this.modification.outputs = this.psatService.results(this.modification.inputs, this.settings)
     // console.log(this.modification.outputs);
  }

}
