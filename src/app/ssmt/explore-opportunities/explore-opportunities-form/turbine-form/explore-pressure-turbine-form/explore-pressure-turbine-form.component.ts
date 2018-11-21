import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PressureTurbineOperationTypes, PressureTurbine } from '../../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../../shared/models/settings';
import { Quantity } from '../../../../../shared/models/steam/steam-inputs';
import { ExploreOpportunitiesService } from '../../../explore-opportunities.service';
import { SsmtService } from '../../../../ssmt.service';
import { FormGroup, ValidatorFn } from '@angular/forms';
import { TurbineService } from '../../../../turbine/turbine.service';

@Component({
  selector: 'app-explore-pressure-turbine-form',
  templateUrl: './explore-pressure-turbine-form.component.html',
  styleUrls: ['./explore-pressure-turbine-form.component.css']
})
export class ExplorePressureTurbineFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  baselineForm: FormGroup;
  @Input()
  modificationForm: FormGroup;
  @Output('emitShowTurbine')
  emitShowTurbine = new EventEmitter<boolean>();
  @Input()
  turbineType: string;
  @Input()
  showFormToggle: boolean;

  turbineTypeOptions: Array<Quantity>;

  showOperation: boolean;
  constructor(private exploreOpportunitiesService: ExploreOpportunitiesService, private ssmtService: SsmtService, private turbineService: TurbineService) { }

  ngOnInit() {
    this.turbineTypeOptions = PressureTurbineOperationTypes;
    this.initOperationType();
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes.showFormToggle && !changes.showFormToggle.isFirstChange()){
      if(this.showFormToggle == false){
        this.showOperation = false;
      }
    }
    if(changes.exploreModIndex && !changes.exploreModIndex.isFirstChange()){
      this.showOperation = false;
      this.initOperationType();
    }
  }


  initOperationType() {
    if (this.baselineForm.controls.operationType.value != this.modificationForm.controls.operationType.value) {
      this.showOperation = true;
      this.emitShowTurbine.emit(true);
    } else if (this.baselineForm.controls.operationType.value != 2) {
      if (this.baselineForm.controls.operationValue1.value != this.modificationForm.controls.operationValue1.value ||
        this.baselineForm.controls.operationValue2.value != this.modificationForm.controls.operationValue2.value) {
        this.showOperation = true;
        this.emitShowTurbine.emit(true);
      }
    }
  }


  toggleOperationType(){
    
  }

  changeBaselineOperationValidators() {
    let tmpObj: PressureTurbine = this.turbineService.getPressureTurbineFromForm(this.baselineForm);
    let tmpValidators: { operationValue1Validators: Array<ValidatorFn>, operationValue2Validators: Array<ValidatorFn> } = this.turbineService.getPressureOperationValueRanges(tmpObj);
    this.baselineForm.controls.operationValue1.setValidators(tmpValidators.operationValue1Validators);
    this.baselineForm.controls.operationValue1.reset(this.baselineForm.controls.operationValue1.value);
    this.baselineForm.controls.operationValue1.markAsDirty();
    this.baselineForm.controls.operationValue2.setValidators(tmpValidators.operationValue2Validators);
    this.baselineForm.controls.operationValue2.reset(this.baselineForm.controls.operationValue2.value);
    this.baselineForm.controls.operationValue2.markAsDirty();
    this.save();
  }

  changeModificationOperationValidators() {
    let tmpObj: PressureTurbine = this.turbineService.getPressureTurbineFromForm(this.modificationForm);
    let tmpValidators: { operationValue1Validators: Array<ValidatorFn>, operationValue2Validators: Array<ValidatorFn> } = this.turbineService.getPressureOperationValueRanges(tmpObj);
    this.modificationForm.controls.operationValue1.setValidators(tmpValidators.operationValue1Validators);
    this.modificationForm.controls.operationValue1.reset(this.modificationForm.controls.operationValue1.value);
    this.modificationForm.controls.operationValue1.markAsDirty();
    this.modificationForm.controls.operationValue2.setValidators(tmpValidators.operationValue2Validators);
    this.modificationForm.controls.operationValue2.reset(this.modificationForm.controls.operationValue2.value);
    this.modificationForm.controls.operationValue2.markAsDirty();
    this.save();
  }


  save() {
    // this.emitSave.emit({baselineTurbine: this.baselineForm.controls, modificationTurbine: this.modificationForm.controls});
    this.emitSave.emit(true);
  }

  focusField(str: string) {
    this.ssmtService.turbineOperationHelp.next('pressure');
    this.exploreOpportunitiesService.currentTab.next('turbine');
    this.exploreOpportunitiesService.currentField.next(str);
  }

  focusOut() {
    // this.exploreOpportunitiesService.currentTab.next('turbine');
    // this.exploreOpportunitiesService.currentField.next('default');
  }
  focusOperation(operationValue: number, str: string){
    this.ssmtService.turbineOperationValue.next(operationValue);
    this.focusField(str)
  }
}
