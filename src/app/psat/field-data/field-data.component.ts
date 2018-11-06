import { Component, OnInit, Output, EventEmitter, ViewChild, Input, SimpleChanges } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { PSAT } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { CompareService } from '../compare.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { Assessment } from '../../shared/models/assessment';
import { PsatWarningService, FieldDataWarnings } from '../psat-warning.service';
import { FieldDataService } from './field-data.service';
@Component({
  selector: 'app-field-data',
  templateUrl: './field-data.component.html',
  styleUrls: ['./field-data.component.css']
})
export class FieldDataComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Output('saved')
  saved = new EventEmitter<boolean>();
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  @Output('openHeadTool')
  openHeadTool = new EventEmitter<boolean>();
  @Output('closeHeadTool')
  closeHeadTool = new EventEmitter<boolean>();
  @Input()
  baseline: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  assessment: Assessment;
  @Input()
  modificationIndex: number;

  formValid: boolean;
  headToolResults: any = {
    differentialElevationHead: 0.0,
    differentialPressureHead: 0.0,
    differentialVelocityHead: 0.0,
    estimatedSuctionFrictionHead: 0.0,
    estimatedDischargeFrictionHead: 0.0,
    pumpHead: 0.0
  };

  loadEstimateMethods: Array<{ display: string, value: number }> = [
    {
      display: 'Power',
      value: 0
    },
    {
      display: 'Current',
      value: 1
    }
  ];
  psatForm: FormGroup;
  fieldDataWarnings: FieldDataWarnings;
  idString: string;
  constructor(private psatWarningService: PsatWarningService, private compareService: CompareService, private helpPanelService: HelpPanelService, private convertUnitsService: ConvertUnitsService, private fieldDataService: FieldDataService) { }

  ngOnInit() {
    if (!this.baseline) {
      this.idString = 'psat_modification_' + this.modificationIndex;
    }
    else {
      this.idString = 'psat_baseline';
    }
    this.init();
    if (!this.selected) {
      this.disableForm();
    }

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      if (!this.selected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
      if (!this.baseline) {
        this.optimizeCalc(this.psatForm.controls.optimizeCalculation.value);
      }
    }
    if (changes.modificationIndex && !changes.modificationIndex.isFirstChange()) {
      this.init();
    }
  }

  init() {
    if (!this.psat.inputs.cost_kw_hour) {
      this.psat.inputs.cost_kw_hour = this.settings.electricityCost;
    }
    this.psatForm = this.fieldDataService.getFormFromObj(this.psat.inputs, this.baseline);
    this.helpPanelService.currentField.next('operatingHours');
    if (!this.baseline) {
      this.optimizeCalc(this.psatForm.controls.optimizeCalculation.value);
    }
    this.checkWarnings();
  }

  disableForm() {
    this.psatForm.controls.loadEstimatedMethod.disable();
  }

  enableForm() {
    this.psatForm.controls.loadEstimatedMethod.enable();
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
  }

  getDisplayUnit(unit: any) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }

  save() {
    this.psat.inputs = this.fieldDataService.getPsatInputsFromForm(this.psatForm, this.psat.inputs);
    this.checkWarnings();
    this.saved.emit(true);
  }

  checkWarnings() {
    this.fieldDataWarnings = this.psatWarningService.checkFieldData(this.psat, this.settings, this.baseline);
  }

  changeLoadMethod() {
    let motorAmpsValidators: Array<ValidatorFn> = new Array();
    let motorKWValidators: Array<ValidatorFn> = new Array();

    if (this.psatForm.controls.loadEstimatedMethod.value == 0) {
      motorKWValidators = [Validators.required];
    } else {
      motorAmpsValidators = [Validators.required];
    }
    this.psatForm.controls.motorAmps.setValidators(motorAmpsValidators);
    this.psatForm.controls.motorAmps.reset(this.psatForm.controls.motorAmps.value);
    if (this.psatForm.controls.motorAmps.value) {
      this.psatForm.controls.motorAmps.markAsDirty();
    }

    this.psatForm.controls.motorKW.setValidators(motorKWValidators);
    this.psatForm.controls.motorKW.reset(this.psatForm.controls.motorKW.value);
    if (this.psatForm.controls.motorKW.value) {
      this.psatForm.controls.motorKW.markAsDirty();
    }
    this.save();
  }


  @ViewChild('headToolModal') public headToolModal: ModalDirective;
  showHeadToolModal() {
    if (this.selected) {
      this.openHeadTool.emit(true);
      this.headToolModal.show();
    }
  }

  hideHeadToolModal() {
    this.closeHeadTool.emit(true);
    if (this.psatForm.controls.head.value != this.psat.inputs.head) {
      this.psatForm.patchValue({
        head: this.psat.inputs.head
      })
    }
    this.headToolModal.hide();
  }

  optimizeCalc(bool: boolean) {
    if (!bool || !this.selected) {
      this.psatForm.controls.sizeMargin.disable();
      // this.psatForm.controls.fixedSpeed.disable();
    } else {
      this.psatForm.controls.sizeMargin.enable();
      // this.psatForm.controls.fixedSpeed.enable();
    }
    this.psatForm.patchValue({
      optimizeCalculation: bool
    });
    this.save();
  }

  canCompare() {
    if (this.compareService.baselinePSAT && this.compareService.modifiedPSAT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  isOperatingHoursDifferent() {
    if (this.canCompare()) {
      return this.compareService.isOperatingHoursDifferent();
    } else {
      return false;
    }
  }
  isCostKwhrDifferent() {
    if (this.canCompare()) {
      return this.compareService.isCostKwhrDifferent();
    } else {
      return false;
    }
  }
  isFlowRateDifferent() {
    if (this.canCompare()) {
      return this.compareService.isFlowRateDifferent();
    } else {
      return false;
    }
  }
  isHeadDifferent() {
    if (this.canCompare()) {
      return this.compareService.isHeadDifferent();
    } else {
      return false;
    }
  }
  isLoadEstimationMethodDifferent() {
    if (this.canCompare()) {
      return this.compareService.isLoadEstimationMethodDifferent();
    } else {
      return false;
    }
  }
  isMotorFieldPowerDifferent() {
    if (this.canCompare()) {
      return this.compareService.isMotorFieldPowerDifferent();
    } else {
      return false;
    }
  }
  isMotorFieldCurrentDifferent() {
    if (this.canCompare()) {
      return this.compareService.isMotorFieldCurrentDifferent();
    } else {
      return false;
    }
  }
  isMotorFieldVoltageDifferent() {
    if (this.canCompare()) {
      return this.compareService.isMotorFieldVoltageDifferent();
    } else {
      return false;
    }
  }
}
