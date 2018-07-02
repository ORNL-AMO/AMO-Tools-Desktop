import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FanEfficiencyInputs } from '../fan-efficiency.component';
import { FanTypes } from '../../../../fsat/fanOptions';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-fan-efficiency-form',
  templateUrl: './fan-efficiency-form.component.html',
  styleUrls: ['./fan-efficiency-form.component.css']
})
export class FanEfficiencyFormComponent implements OnInit {
  @Input()
  inputs: FanEfficiencyInputs;
  @Input()
  settings: Settings;
  @Output('emitChange')
  emitChange = new EventEmitter<string>();
  @Output('calculate')
  calculate = new EventEmitter<boolean>();

  fanTypes: Array<{ display: string, value: number }>;

  compressibilityFactorError: string = null;
  flowRateError: string = null;
  outletPressureError: string = null;
  fanSpeedError: string = null;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.fanTypes = FanTypes;
  }


  focusField(str: string) {
    this.emitChange.emit(str);
  }

  emitCalculate() {
    this.calculate.emit(true);
  }
  getDisplayUnit(unit: any) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }

}
