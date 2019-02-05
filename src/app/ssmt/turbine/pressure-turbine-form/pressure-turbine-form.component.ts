import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { Quantity } from '../../../shared/models/steam/steam-inputs';
import { PressureTurbineOperationTypes, PressureTurbine } from '../../../shared/models/steam/ssmt';
import { SsmtService } from '../../ssmt.service';
import { CompareService } from '../../compare.service';
import { TurbineService } from '../turbine.service';

@Component({
  selector: 'app-pressure-turbine-form',
  templateUrl: './pressure-turbine-form.component.html',
  styleUrls: ['./pressure-turbine-form.component.css']
})
export class PressureTurbineFormComponent implements OnInit {
  @Input()
  turbineForm: FormGroup;
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  @Input()
  pressureTurbineString: string;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  inSetup: boolean;
  @Input()
  idString: string;

  turbineTypeOptions: Array<Quantity>;
  constructor(private ssmtService: SsmtService, private compareService: CompareService, private turbineService: TurbineService) {
  }

  ngOnInit() {
    this.turbineTypeOptions = PressureTurbineOperationTypes;
    if (this.selected == false) {
      this.disableForm();
    } else {
      this.enableForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      if (this.selected == false) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    }
  }

  changeOperationValidators() {
    let tmpObj: PressureTurbine = this.turbineService.getPressureTurbineFromForm(this.turbineForm);
    let tmpValidators: { operationValue1Validators: Array<ValidatorFn>, operationValue2Validators: Array<ValidatorFn> } = this.turbineService.getPressureOperationValueRanges(tmpObj);
    this.turbineForm.controls.operationValue1.setValidators(tmpValidators.operationValue1Validators);
    this.turbineForm.controls.operationValue1.reset(this.turbineForm.controls.operationValue1.value);
    this.turbineForm.controls.operationValue1.markAsDirty();
    this.turbineForm.controls.operationValue2.setValidators(tmpValidators.operationValue2Validators);
    this.turbineForm.controls.operationValue2.reset(this.turbineForm.controls.operationValue2.value);
    this.turbineForm.controls.operationValue2.markAsDirty();
    this.save();
  }

  changeOperation1Validators() {
    let tmpObj: PressureTurbine = this.turbineService.getPressureTurbineFromForm(this.turbineForm);
    let tmpValidators: { operationValue1Validators: Array<ValidatorFn>, operationValue2Validators: Array<ValidatorFn> } = this.turbineService.getPressureOperationValueRanges(tmpObj);
    this.turbineForm.controls.operationValue1.setValidators(tmpValidators.operationValue1Validators);
    this.turbineForm.controls.operationValue1.reset(this.turbineForm.controls.operationValue1.value);
    this.turbineForm.controls.operationValue1.markAsDirty();
    this.save();
  }

  changeOperation2Validators() {
    let tmpObj: PressureTurbine = this.turbineService.getPressureTurbineFromForm(this.turbineForm);
    let tmpValidators: { operationValue1Validators: Array<ValidatorFn>, operationValue2Validators: Array<ValidatorFn> } = this.turbineService.getPressureOperationValueRanges(tmpObj);
    this.turbineForm.controls.operationValue2.setValidators(tmpValidators.operationValue2Validators);
    this.turbineForm.controls.operationValue2.reset(this.turbineForm.controls.operationValue2.value);
    this.turbineForm.controls.operationValue2.markAsDirty();
    this.save();
  }

  enableForm() {
    this.turbineForm.controls.operationType.enable();
  }

  disableForm() {
    this.turbineForm.controls.operationType.disable();
  }

  save() {
    this.emitSave.emit(true);
  }

  focusField(str: string) {
    this.ssmtService.turbineOperationValue.next(this.turbineForm.controls.operationType.value);
    this.ssmtService.turbineOperationHelp.next('pressure');
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }

  canCompare() {
    if (this.compareService.baselineSSMT && this.compareService.modifiedSSMT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }
  isIsentropicEfficiencyDifferent() {
    if (this.canCompare()) {
      return this.compareService.isIsentropicEfficiencyDifferent(this.pressureTurbineString);
    } else {
      return false;
    }
  }
  isGenerationEfficiencyDifferent() {
    if (this.canCompare()) {
      return this.compareService.isGenerationEfficiencyDifferent(this.pressureTurbineString);
    } else {
      return false;
    }
  }
  isOperationTypeDifferent() {
    if (this.canCompare()) {
      return this.compareService.isOperationTypeDifferent(this.pressureTurbineString);
    } else {
      return false;
    }
  }
  isOperationValue1Different() {
    if (this.canCompare()) {
      return this.compareService.isOperationValue1Different(this.pressureTurbineString);
    } else {
      return false;
    }
  }
  isOperationValue2Different() {
    if (this.canCompare()) {
      return this.compareService.isOperationValue2Different(this.pressureTurbineString);
    } else {
      return false;
    }
  }
  isUseTurbineDifferent() {
    if (this.canCompare()) {
      return this.compareService.isUseTurbineDifferent(this.pressureTurbineString);
    } else {
      return false;
    }
  }
}
