import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FanFieldDataWarnings } from '../../../fsat-warning.service';
import { FSAT } from '../../../../shared/models/fans';
import { Settings } from 'electron';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { HelpPanelService } from '../../../help-panel/help-panel.service';
import { ModifyConditionsService } from '../../../modify-conditions/modify-conditions.service';

@Component({
  selector: 'app-variable-frequency-drive-form',
  templateUrl: './variable-frequency-drive-form.component.html',
  styleUrls: ['./variable-frequency-drive-form.component.css']
})
export class VariableFrequencyDriveFormComponent implements OnInit {
  @Input()
  baselineFieldDataForm: FormGroup;
  @Input()
  modificationFieldDataForm: FormGroup;
  @Input()
  baselineMotorForm: FormGroup;
  @Input()
  modificationMotorForm: FormGroup;
  @Input()
  baselineFanSetupForm: FormGroup;
  @Input()
  modificationFanSetupForm: FormGroup;
  @Input()
  baselineFanEfficiency: number;
  @Input()
  modificationWarnings: FanFieldDataWarnings;
  @Input()
  baselineWarnings: FanFieldDataWarnings;
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Input()
  fsat: FSAT;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();


  constructor(private convertUnitsService: ConvertUnitsService, private helpPanelService: HelpPanelService, private modifyConditionsService: ModifyConditionsService) { }

  ngOnInit() {
  }
  calculate() {
    this.emitCalculate.emit(true);
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
    this.modifyConditionsService.modifyConditionsTab.next('fan-field-data');
  }

  getDisplayUnit(unit: string) {
    let tmpUnit = this.convertUnitsService.getUnit(unit);
    let dsp = tmpUnit.unit.name.display.replace('(', '');
    dsp = dsp.replace(')', '');
    return dsp;
  }
}
