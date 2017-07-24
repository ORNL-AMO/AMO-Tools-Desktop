import { Component, OnInit, Input, } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { FlowCalculations, FlowCalculationsOutput } from '../../../../shared/models/phast/flowCalculations';
import { PhastService } from '../../../../phast/phast.service';
@Component({
  selector: 'app-energy-use-form',
  templateUrl: './energy-use-form.component.html',
  styleUrls: ['./energy-use-form.component.css']
})
export class EnergyUseFormComponent implements OnInit {
  @Input()
  flowCalculations: FlowCalculations;
  @Input()
  flowCalculationResults: FlowCalculationsOutput;

  constructor(private suiteDbService: SuiteDbService, private phastService: PhastService) { }

  ngOnInit() {
    
  }

  calculate(){

  }

}
