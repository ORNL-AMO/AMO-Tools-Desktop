import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../../shared/models/settings';
import { SSMT, CondensingTurbineOperationTypes } from '../../../../../shared/models/steam/ssmt';
import { Quantity } from '../../../../../shared/models/steam/steam-inputs';
import { ExploreOpportunitiesService } from '../../../explore-opportunities.service';
import { SsmtService } from '../../../../ssmt.service';
import { FormGroup, Validators } from '@angular/forms';
import { TurbineService } from '../../../../turbine/turbine.service';

@Component({
  selector: 'app-explore-condensing-turbine-form',
  templateUrl: './explore-condensing-turbine-form.component.html',
  styleUrls: ['./explore-condensing-turbine-form.component.css']
})
export class ExploreCondensingTurbineFormComponent implements OnInit {
  @Input()
  baselineForm: FormGroup;
  @Input()
  modificationForm: FormGroup;
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Output('emitShowTurbine')
  emitShowTurbine = new EventEmitter<boolean>();
  @Input()
  showFormToggle: boolean;

  showCondenserPressure: boolean;
  showOperation: boolean;
  turbineOptionTypes: Array<Quantity>;
  constructor(private exploreOpportunitiesService: ExploreOpportunitiesService, private ssmtService: SsmtService, private turbineService: TurbineService) { }

  ngOnInit() {
    this.turbineOptionTypes = CondensingTurbineOperationTypes;
    this.initForm();

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.showFormToggle && !changes.showFormToggle.isFirstChange()) {
      if (this.showFormToggle == false) {
        this.showOperation = false;
        this.showCondenserPressure = false;
      }
    }
    if (changes.exploreModIndex && !changes.exploreModIndex.isFirstChange()) {
      this.showOperation = false;
      this.showCondenserPressure = false;
      this.initForm();
    }
  }
  changeBaselineOperationValidators() {
    let tmpOperationMinMax: { min: number, max: number } = this.turbineService.getCondensingOperationRange(this.baselineForm.controls.operationType.value);
    if (tmpOperationMinMax.max) {
      this.baselineForm.controls.operationValue.setValidators([Validators.required, Validators.min(tmpOperationMinMax.min), Validators.max(tmpOperationMinMax.max)]);
    } else {
      this.baselineForm.controls.operationValue.setValidators([Validators.required, Validators.min(tmpOperationMinMax.min)]);
    }
    this.baselineForm.controls.operationValue.reset(this.baselineForm.controls.operationValue.value);
    this.baselineForm.controls.operationValue.markAsDirty();
    this.save();
  }

  changeModificationOperationValidators() {
    let tmpOperationMinMax: { min: number, max: number } = this.turbineService.getCondensingOperationRange(this.modificationForm.controls.operationType.value);
    if (tmpOperationMinMax.max) {
      this.modificationForm.controls.operationValue.setValidators([Validators.required, Validators.min(tmpOperationMinMax.min), Validators.max(tmpOperationMinMax.max)]);
    } else {
      this.modificationForm.controls.operationValue.setValidators([Validators.required, Validators.min(tmpOperationMinMax.min)]);
    }
    this.modificationForm.controls.operationValue.reset(this.modificationForm.controls.operationValue.value);
    this.modificationForm.controls.operationValue.markAsDirty();
    this.save();
  }


  initForm() {
    this.initCondenserPressure();
    this.initOperationType();
    if (this.showCondenserPressure || this.showOperation) {
      this.emitShowTurbine.emit(true);
    }
  }

  initCondenserPressure() {
    if (this.baselineForm.controls.condenserPressure.value != this.modificationForm.controls.condenserPressure.value) {
      this.showCondenserPressure = true;
    }
  }

  initOperationType() {
    if (this.baselineForm.controls.operationType.value != this.modificationForm.controls.operationType.value ||
      this.baselineForm.controls.operationValue.value != this.modificationForm.controls.operationValue.value) {
      this.showOperation = true;
    }
  }

  toggleCondenserPressure() {
    if (this.showCondenserPressure == false) {
      this.modificationForm.controls.condenserPressure.patchValue(this.baselineForm.controls.condenserPressure.value);
      this.save();
    }
  }

  toggleOperationType() {
    if (this.showOperation == false) {
      this.modificationForm.controls.operationType.patchValue(this.baselineForm.controls.operationType.value);
      this.modificationForm.controls.operationValue.patchValue(this.baselineForm.controls.operationValue.value);
      this.save();
    }
  }

  save() {
    this.emitSave.emit(true);
  }

  focusField(str: string) {
    this.ssmtService.turbineOperationHelp.next('condensing')
    this.exploreOpportunitiesService.currentTab.next('turbine');
    this.exploreOpportunitiesService.currentField.next(str);
  }

  focusOut() {
    // this.exploreOpportunitiesService.currentField.next('default');
  }

  focusOperation(operationValue: number) {
    this.ssmtService.turbineOperationValue.next(operationValue);
    this.focusField('operationValue')
  }
}
