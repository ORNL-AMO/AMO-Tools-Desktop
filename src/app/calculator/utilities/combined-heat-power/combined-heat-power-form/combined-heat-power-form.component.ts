import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CombinedHeatPower } from '../../../../shared/models/combinedHeatPower';
@Component({
  selector: 'app-combined-heat-power-form',
  templateUrl: './combined-heat-power-form.component.html',
  styleUrls: ['./combined-heat-power-form.component.css']
})
export class CombinedHeatPowerFormComponent implements OnInit {
  @Input()
  inputs: CombinedHeatPower;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();

  calculationOptions: any = [
    {
      name: 'option 1',
      value: 0,
    }, {
      name: 'option 2',
      value: 1,
    }
  ];

  options: Array<string> = [
    'Cost Avoided',
    'Standby Rate'
  ]
  constructor() { }

  ngOnInit() {
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  setCalculationOption() {
    this.calculate();
  }

}
