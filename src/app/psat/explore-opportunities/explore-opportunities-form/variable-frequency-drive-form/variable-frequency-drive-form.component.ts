import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldDataWarnings } from '../../../psat-warning.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { pumpTypesConstant, driveConstants } from '../../../psatConstants';

@Component({
  selector: 'app-variable-frequency-drive-form',
  templateUrl: './variable-frequency-drive-form.component.html',
  styleUrls: ['./variable-frequency-drive-form.component.css']
})
export class VariableFrequencyDriveFormComponent implements OnInit {
  @Input()
  baselinePumpFluidForm: FormGroup;
  @Input()
  modificationPumpFluidForm: FormGroup;
  @Input()
  baselineFieldDataForm: FormGroup;
  @Input()
  modificationFieldDataForm: FormGroup;
  @Input()
  baselineFieldDataWarnings: FieldDataWarnings;
  @Input()
  modificationFieldDataWarnings: FieldDataWarnings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('openHeadToolModal')
  openHeadToolModal = new EventEmitter<boolean>();



  pumpTypes: Array<{ display: string, value: number }>;
  drives: Array<{ display: string, value: number }>;

  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.pumpTypes = pumpTypesConstant;
    this.drives = driveConstants;
    // this.initForms();
    // this.checkWarnings();
  }

  calculate() {
    //not needed unless we enable baseline editing
    //this.psat.inputs = this.fieldDataService.getPsatInputsFromForm(this.baselineForm, this.psat.inputs);
    // this.psat.modifications[this.exploreModIndex].psat.inputs = this.pumpFluidService.getPsatInputsFromForm(this.modificationPumpFluidForm, this.psat.modifications[this.exploreModIndex].psat.inputs);
    // this.psat.modifications[this.exploreModIndex].psat.inputs = this.fieldDataService.getPsatInputsFromForm(this.modificationFieldDataForm, this.psat.modifications[this.exploreModIndex].psat.inputs);
    // this.checkWarnings();
    this.emitCalculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  // checkWarnings() {
  //     this.baselineFieldDataWarnings = this.psatWarningService.checkFieldData(this.psat, this.settings);
  //     this.modificationFieldDataWarnings = this.psatWarningService.checkFieldData(this.psat.modifications[this.exploreModIndex].psat, this.settings);
  // }

  getDisplayUnit(unit: string) {
    let tmpUnit = this.convertUnitsService.getUnit(unit);
    let dsp = tmpUnit.unit.name.display.replace('(', '');
    dsp = dsp.replace(')', '');
    return dsp;
  }

  showHeadToolModal() {
    this.openHeadToolModal.emit(true);
  }
}
