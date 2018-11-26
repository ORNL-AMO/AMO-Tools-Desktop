import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../psat.service';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
import { FieldDataWarnings, PsatWarningService, MotorWarnings } from '../../psat-warning.service';
import { FieldDataService } from '../../field-data/field-data.service';
import { PumpFluidService } from '../../pump-fluid/pump-fluid.service';
import { MotorService } from '../../motor/motor.service';
@Component({
  selector: 'app-explore-opportunities-form',
  templateUrl: './explore-opportunities-form.component.html',
  styleUrls: ['./explore-opportunities-form.component.css']
})
export class ExploreOpportunitiesFormComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  exploreModIndex: number;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('emitAddNewMod')
  emitAddNewMod = new EventEmitter<boolean>();


  showSizeMargin: boolean;

  baselinePumpFluidForm: FormGroup;
  modificationPumpFluidForm: FormGroup;
  
  baselineMotorForm: FormGroup;
  modificationMotorForm: FormGroup;
  
  baselineMotorWarnings: MotorWarnings;
  modificationMotorWarnings: MotorWarnings;
  
  baselineFieldDataForm: FormGroup;
  modificationFieldDataForm: FormGroup;
  
  baselineFieldDataWarnings: FieldDataWarnings;
  modificationFieldDataWarnings: FieldDataWarnings;
  constructor(private fieldDataService: FieldDataService, private pumpFluidService: PumpFluidService, private psatWarningService: PsatWarningService, private motorService: MotorService) { }


  ngOnInit() {
    this.initForms();
    this.checkWarnings();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.initForms();
      }
    }
  }

  initForms(){
    this.baselineMotorForm = this.motorService.getFormFromObj(this.psat.inputs);
    this.baselineMotorForm.disable();
    this.modificationMotorForm = this.motorService.getFormFromObj(this.psat.modifications[this.exploreModIndex].psat.inputs);

    this.baselineFieldDataForm = this.fieldDataService.getFormFromObj(this.psat.inputs, true);
    this.baselineFieldDataForm.disable();
    this.modificationFieldDataForm = this.fieldDataService.getFormFromObj(this.psat.modifications[this.exploreModIndex].psat.inputs, false);

    this.baselinePumpFluidForm = this.pumpFluidService.getFormFromObj(this.psat.inputs);
    this.baselinePumpFluidForm.disable();
    this.modificationPumpFluidForm = this.pumpFluidService.getFormFromObj(this.psat.modifications[this.exploreModIndex].psat.inputs);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  calculate(str?: string) {
    if (str == 'fixedSpecificSpeed') {
      this.focusField('fixedSpecificSpeed');
    }
    this.save();
    this.emitCalculate.emit(true);
  }

  save() {
    this.psat.modifications[this.exploreModIndex].psat.inputs = this.pumpFluidService.getPsatInputsFromForm(this.modificationPumpFluidForm, this.psat.modifications[this.exploreModIndex].psat.inputs);
    this.psat.modifications[this.exploreModIndex].psat.inputs = this.motorService.getInputsFromFrom(this.modificationMotorForm, this.psat.modifications[this.exploreModIndex].psat.inputs);
    this.psat.modifications[this.exploreModIndex].psat.inputs = this.fieldDataService.getPsatInputsFromForm(this.modificationFieldDataForm, this.psat.modifications[this.exploreModIndex].psat.inputs);
    this.checkWarnings();
    this.emitSave.emit(true);
  }

  checkWarnings(){
    this.baselineFieldDataWarnings = this.psatWarningService.checkFieldData(this.psat, this.settings);
    this.modificationFieldDataWarnings = this.psatWarningService.checkFieldData(this.psat.modifications[this.exploreModIndex].psat, this.settings);

    this.baselineMotorWarnings = this.psatWarningService.checkMotorWarnings(this.psat, this.settings);
    this.modificationMotorWarnings = this.psatWarningService.checkMotorWarnings(this.psat.modifications[this.exploreModIndex].psat, this.settings);
  }

  addNewMod(){
    this.emitAddNewMod.emit(true);
  }

}
