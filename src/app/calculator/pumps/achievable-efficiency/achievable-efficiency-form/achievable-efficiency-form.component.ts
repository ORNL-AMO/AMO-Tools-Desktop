import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-achievable-efficiency-form',
  templateUrl: './achievable-efficiency-form.component.html',
  styleUrls: ['./achievable-efficiency-form.component.css']
})
export class AchievableEfficiencyFormComponent implements OnInit {
  @Input()
  efficiencyForm: FormGroup;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
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
    // NOT USED FOR GRAPH!
    // 'Specified Optimal Efficiency'
  ];
  tmpPumpType: string;
  tmpFlowRate: number;
  flowRateError: string = null;
  constructor() { }

  ngOnInit() {
    if (this.efficiencyForm) {
      this.tmpFlowRate = this.efficiencyForm.controls.flowRate.value;
      this.tmpPumpType = this.efficiencyForm.controls.pumpType.value;
    }
  }

  emitChange() {
    if (this.checkFlowRate()) {
      this.efficiencyForm.patchValue({
        pumpType: this.tmpPumpType,
        flowRate: this.tmpFlowRate
      })
      this.calculate.emit(true);
    }
  }

  checkFlowRate() {
    if (this.tmpFlowRate < 0) {
      this.flowRateError = 'Flow rate too small';
      return false;
    }
    else if (this.tmpFlowRate > 5000) {
      this.flowRateError = 'Flow rate too large';
      return false;
    } else {
      this.flowRateError = null;
      return true;
    }
  }
}





