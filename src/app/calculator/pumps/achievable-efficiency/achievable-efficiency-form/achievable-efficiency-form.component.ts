import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-achievable-efficiency-form',
  templateUrl: './achievable-efficiency-form.component.html',
  styleUrls: ['./achievable-efficiency-form.component.css']
})
export class AchievableEfficiencyFormComponent implements OnInit {
  @Input()
  efficiencyForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();

  pumpTypes: Array<string> = [
    'End Suction Slurry',
    'End Suction Sewage',
    'End Suction Stock',
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

  constructor() { }

  ngOnInit() {
    this.checkForm();
  }

  checkForm() {
    if (
      this.efficiencyForm.controls.pumpType.status == 'VALID' && 
      this.efficiencyForm.controls.flowRate.status == 'VALID'
    ) {
      this.calculate.emit(true);
    }
  }

}
