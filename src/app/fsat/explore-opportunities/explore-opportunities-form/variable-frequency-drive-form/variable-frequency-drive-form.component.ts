import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { FanFieldDataWarnings } from '../../../fsat-warning.service';
import { FSAT } from '../../../../shared/models/fans';
import { HelpPanelService } from '../../../help-panel/help-panel.service';
import { ModifyConditionsService } from '../../../modify-conditions/modify-conditions.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-variable-frequency-drive-form',
  templateUrl: './variable-frequency-drive-form.component.html',
  styleUrls: ['./variable-frequency-drive-form.component.css']
})
export class VariableFrequencyDriveFormComponent implements OnInit {
  @Input()
  baselineFieldDataForm: UntypedFormGroup;
  @Input()
  modificationFieldDataForm: UntypedFormGroup;
  @Input()
  baselineMotorForm: UntypedFormGroup;
  @Input()
  modificationMotorForm: UntypedFormGroup;
  @Input()
  baselineFanSetupForm: UntypedFormGroup;
  @Input()
  modificationFanSetupForm: UntypedFormGroup;
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
  @Output('showPressureModal')
  showPressureModal = new EventEmitter<string>();

  constructor(private helpPanelService: HelpPanelService, private modifyConditionsService: ModifyConditionsService) { }

  ngOnInit() {
  }
  calculate() {
    this.emitCalculate.emit(true);
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
    this.modifyConditionsService.modifyConditionsTab.next('fan-field-data');
  }

  showInletPressureModal() {
    this.showPressureModal.emit('inlet');
  }

  showOutletPressureModal() {
    this.showPressureModal.emit('outlet');
  }
}
