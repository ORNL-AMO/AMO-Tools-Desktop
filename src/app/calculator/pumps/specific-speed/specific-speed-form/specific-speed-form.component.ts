import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-specific-speed-form',
  templateUrl: './specific-speed-form.component.html',
  styleUrls: ['./specific-speed-form.component.css']
})
export class SpecificSpeedFormComponent implements OnInit {
  @Input()
  speedForm: any;
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
    //'Specified Optimal Efficiency'
  ];
  constructor() { }

  ngOnInit() {
  }

  emitCalculate() {
    this.calculate.emit(true);
  }

}
