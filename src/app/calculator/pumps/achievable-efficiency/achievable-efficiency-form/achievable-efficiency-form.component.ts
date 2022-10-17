import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { PsatWarningService } from '../../../../psat/psat-warning.service';
import { pumpTypesConstant } from '../../../../psat/psatConstants';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-achievable-efficiency-form',
  templateUrl: './achievable-efficiency-form.component.html',
  styleUrls: ['./achievable-efficiency-form.component.css']
})
export class AchievableEfficiencyFormComponent implements OnInit {
  @Input()
  efficiencyForm: UntypedFormGroup;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  toggleExampleData: boolean;

  pumpTypes: Array<{ display: string, value: number }>;
  flowRateWarning: string = null;
  constructor(private psatWarningsService: PsatWarningService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.pumpTypes = JSON.parse(JSON.stringify(pumpTypesConstant));
    //remove specified efficiency
    this.pumpTypes.pop();
    this.checkWarnings();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggleExampleData && !changes.toggleExampleData.firstChange) {
      this.emitChange();
    }
  }

  emitChange() {
    this.checkWarnings();
    this.calculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  checkWarnings() {
    this.flowRateWarning = this.psatWarningsService.checkFlowRate(this.efficiencyForm.controls.pumpType.value, this.efficiencyForm.controls.flowRate.value, this.settings);
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





