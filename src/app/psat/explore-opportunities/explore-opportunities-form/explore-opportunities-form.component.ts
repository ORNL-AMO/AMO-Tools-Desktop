import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { FieldDataWarnings, PsatWarningService, MotorWarnings, OperationsWarnings } from '../../psat-warning.service';
import { FieldDataService } from '../../field-data/field-data.service';
import { PumpFluidService } from '../../pump-fluid/pump-fluid.service';
import { MotorService } from '../../motor/motor.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { PsatService } from '../../psat.service';
import { PumpOperationsService } from '../../pump-operations/pump-operations.service';
import { IntegrationStateService } from '../../../shared/connected-inventory/integration-state.service';
import { ConnectedInventoryData } from '../../../shared/connected-inventory/integrations';
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



  @ViewChild('headToolModal', { static: false }) public headToolModal: ModalDirective;
  headToolResults: any = {
    differentialElevationHead: 0.0,
    differentialPressureHead: 0.0,
    differentialVelocityHead: 0.0,
    estimatedSuctionFrictionHead: 0.0,
    estimatedDischargeFrictionHead: 0.0,
    pumpHead: 0.0
  };

  baselinePumpFluidForm: UntypedFormGroup;
  modificationPumpFluidForm: UntypedFormGroup;

  baselineMotorForm: UntypedFormGroup;
  modificationMotorForm: UntypedFormGroup;

  baselineMotorWarnings: MotorWarnings;
  modificationMotorWarnings: MotorWarnings;

  baselineFieldDataForm: UntypedFormGroup;
  modificationFieldDataForm: UntypedFormGroup;

  baselineFieldDataWarnings: FieldDataWarnings;
  modificationFieldDataWarnings: FieldDataWarnings;

  baselineOperationsForm: UntypedFormGroup;
  modificationOperationsForm: UntypedFormGroup;

  baselineOperationsWarnings: OperationsWarnings;
  modificationOperationsaWarnings: OperationsWarnings;

  showHeadTool: boolean = false;
  connectedInventoryData: ConnectedInventoryData;
  constructor(private psatService: PsatService,
    private integrationStateService: IntegrationStateService,
    private fieldDataService: FieldDataService, private pumpFluidService: PumpFluidService, private psatWarningService: PsatWarningService, private motorService: MotorService, private pumpOperationsService: PumpOperationsService) { }


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
    this.connectedInventoryData = this.integrationStateService.connectedInventoryData.getValue();

    if (this.psat.modifications[this.exploreModIndex].psat.inputs.isVFD) {
      this.psat.modifications[this.exploreModIndex].exploreOppsShowVfd = {hasOpportunity: true, display: "Install VFD"};
      delete this.psat.modifications[this.exploreModIndex].psat.inputs.isVFD;
    } else if (!this.psat.modifications[this.exploreModIndex].exploreOppsShowVfd) {
      this.psat.modifications[this.exploreModIndex].exploreOppsShowVfd = {hasOpportunity: false, display: "Install VFD"};
    }
    this.baselineMotorForm = this.motorService.getFormFromObj(this.psat.inputs);
    this.baselineMotorForm.disable();
    this.modificationMotorForm = this.motorService.getFormFromObj(this.psat.modifications[this.exploreModIndex].psat.inputs);

    this.baselineFieldDataForm = this.fieldDataService.getFormFromObj(this.psat.inputs, true);
    this.baselineFieldDataForm.disable();
    this.modificationFieldDataForm = this.fieldDataService.getFormFromObj(this.psat.modifications[this.exploreModIndex].psat.inputs, false);

    this.baselinePumpFluidForm = this.pumpFluidService.getFormFromObj(this.psat.inputs);
    this.baselinePumpFluidForm.disable();
    this.modificationPumpFluidForm = this.pumpFluidService.getFormFromObj(this.psat.modifications[this.exploreModIndex].psat.inputs);

    this.baselineOperationsForm = this.pumpOperationsService.getFormFromObj(this.psat.inputs);
    this.baselineOperationsForm.disable();
    this.modificationOperationsForm = this.pumpOperationsService.getFormFromObj(this.psat.modifications[this.exploreModIndex].psat.inputs);
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
    this.psat.modifications[this.exploreModIndex].psat.inputs = this.pumpOperationsService.getPsatInputsFromForm(this.modificationOperationsForm, this.psat.modifications[this.exploreModIndex].psat.inputs);
    this.checkWarnings();
    this.emitSave.emit(true);
  }

  checkWarnings() {
    this.baselineFieldDataWarnings = this.psatWarningService.checkFieldData(this.psat, this.settings);
    this.modificationFieldDataWarnings = this.psatWarningService.checkFieldData(this.psat.modifications[this.exploreModIndex].psat, this.settings);

    this.baselineMotorWarnings = this.psatWarningService.checkMotorWarnings(this.psat, this.settings, false);
    this.modificationMotorWarnings = this.psatWarningService.checkMotorWarnings(this.psat.modifications[this.exploreModIndex].psat, this.settings, true);

    this.baselineOperationsWarnings = this.psatWarningService.checkPumpOperations(this.psat, this.settings);
    this.modificationOperationsaWarnings = this.psatWarningService.checkPumpOperations(this.psat.modifications[this.exploreModIndex].psat, this.settings);
  }

  addNewMod() {
    this.emitAddNewMod.emit(true);
  }

  setVFD(){
    if(this.psat.modifications[this.exploreModIndex].exploreOppsShowVfd.hasOpportunity){
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
