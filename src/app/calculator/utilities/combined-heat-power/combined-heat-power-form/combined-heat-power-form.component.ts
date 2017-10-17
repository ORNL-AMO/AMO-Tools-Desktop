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
      name: 'Cost Avoided',
      value: 0,
    }, {
      name: 'Standby Rate',
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
    if (this.inputs.option == 0) {
      this.inputs.percentAvgkWhElectricCostAvoidedOrStandbyRate = 75;
    } else if (this.inputs.option == 1) {
      this.inputs.percentAvgkWhElectricCostAvoidedOrStandbyRate = 0;
    }
    this.calculate();
  }

}
