import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-pump-fluid',
  templateUrl: './pump-fluid.component.html',
  styleUrls: ['./pump-fluid.component.css']
})
export class PumpFluidComponent implements OnInit {
  @Input()
  psatForm: any;
  @Output('changeField')
  changeField = new EventEmitter<string>();

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

  drives: Array<string> = [
    'Direct Drive',
    'Belt Drive'
  ];

  constructor() { }

  ngOnInit() {
  }

  addNum(str: string) {
    if (str == 'viscosity') {
      this.psatForm.value.viscosity++;
    } else if (str == 'stages') {
      this.psatForm.value.stages++;
    }
  }

  subtractNum(str: string) {
    if (str == 'viscosity') {
      if (this.psatForm.value.viscosity != 0) {
        this.psatForm.value.viscosity--;
      }
    } else if (str == 'stages') {
      if (this.psatForm.value.stages != 0) {
        this.psatForm.value.stages--;
      }
    }
  }

  focusField(str: string){
    console.log(str);
    this.changeField.emit(str);
  }

}
