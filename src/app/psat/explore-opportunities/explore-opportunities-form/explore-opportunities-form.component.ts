import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { FieldDataWarnings, PsatWarningService, MotorWarnings } from '../../psat-warning.service';
import { FieldDataService } from '../../field-data/field-data.service';
import { PumpFluidService } from '../../pump-fluid/pump-fluid.service';
import { MotorService } from '../../motor/motor.service';
import { ModalDirective } from 'ngx-bootstrap';
import { PsatService } from '../../psat.service';
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
  @Input()
  assessmentId: number;



  @ViewChild('headToolModal') public headToolModal: ModalDirective;
  headToolResults: any = {
    differentialElevationHead: 0.0,
    differentialPressureHead: 0.0,
    differentialVelocityHead: 0.0,
    estimatedSuctionFrictionHead: 0.0,
    estimatedDischargeFrictionHead: 0.0,
    pumpHead: 0.0
  };

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
  showHeadTool: boolean = false;
  constructor(private psatService: PsatService, private fieldDataService: FieldDataService, private pumpFluidService: PumpFluidService, private psatWarningService: PsatWarningService, private motorService: MotorService) { }


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

  ngOnDestroy(){
    if (this.psat.modifications[this.exploreModIndex] && !this.psat.modifications[this.exploreModIndex].psat.name) {
      this.psat.modifications[this.exploreModIndex].psat.name = 'Opportunities Modification';
      this.save();
    }
  }

  initForms() {
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

  checkWarnings() {
    this.baselineFieldDataWarnings = this.psatWarningService.checkFieldData(this.psat, this.settings);
    this.modificationFieldDataWarnings = this.psatWarningService.checkFieldData(this.psat.modifications[this.exploreModIndex].psat, this.settings);

    this.baselineMotorWarnings = this.psatWarningService.checkMotorWarnings(this.psat, this.settings, false);
    this.modificationMotorWarnings = this.psatWarningService.checkMotorWarnings(this.psat.modifications[this.exploreModIndex].psat, this.settings, true);
  }

  addNewMod() {
    this.emitAddNewMod.emit(true);
  }

  setVFD(){
    if(this.psat.modifications[this.exploreModIndex].psat.inputs.isVFD){
      this.modificationPumpFluidForm.controls.drive.patchValue(4);
      this.modificationPumpFluidForm.controls.specifiedDriveEfficiency.patchValue(95);
    }else{
      this.modificationPumpFluidForm.controls.drive.patchValue(this.baselinePumpFluidForm.controls.drive.value);
      this.modificationPumpFluidForm.controls.specifiedDriveEfficiency.patchValue(95);
    }
    this.calculate();
  }


  showHeadToolModal() {
    this.psatService.modalOpen.next(true);
    this.headToolModal.show();
    this.showHeadTool = true;
  }

  hideHeadToolModal() {
    this.modificationFieldDataForm.controls.head.patchValue(this.psat.modifications[this.exploreModIndex].psat.inputs.head)
    this.save();
    this.psatService.modalOpen.next(false);    
    this.headToolModal.hide();

    this.showHeadTool = false;
  }


}
