import { Component, OnInit, Output, EventEmitter, ViewChild, Input, SimpleChanges, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { PSAT } from '../../shared/models/psat';
import { PsatService } from '../psat.service';
import { Settings } from '../../shared/models/settings';
import { CompareService } from '../compare.service';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
import { Assessment } from '../../shared/models/assessment';
import { PsatWarningService, FieldDataWarnings } from '../psat-warning.service';
@Component({
  selector: 'app-field-data',
  templateUrl: './field-data.component.html',
  styleUrls: ['./field-data.component.css']
})
export class FieldDataComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Output('isValid')
  isValid = new EventEmitter<boolean>();
  @Output('isInvalid')
  isInvalid = new EventEmitter<boolean>();
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

  //Create your array of options
  //first item in array will be default selected, can modify that functionality later if desired
  loadEstimateMethods: Array<string> = [
    'Power',
    'Current'
  ];
  psatForm: FormGroup;
  isFirstChange: boolean = true;
  fieldDataWarnings: FieldDataWarnings;
  constructor(private psatWarningService: PsatWarningService, private psatService: PsatService, private compareService: CompareService, private cd: ChangeDetectorRef, private helpPanelService: HelpPanelService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.init();
    if (!this.selected) {
      this.disableForm();
    }
    
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.isFirstChange) {
      if (changes.selected) {
        if (!this.selected) {
          this.disableForm();
        } else {
          this.enableForm();
        }
        if (!this.baseline) {
          this.optimizeCalc(this.psatForm.controls.optimizeCalculation.value);
        }
      }
      if (changes.modificationIndex) {
        this.init();
      }
    }
    else {
      this.isFirstChange = false;
    }
  }

  init() {
    this.psatForm = this.psatService.getFormFromPsat(this.psat.inputs);
    this.checkForm(this.psatForm);
    this.helpPanelService.currentField.next('operatingFraction');
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

  checkForm(form: FormGroup) {
    this.formValid = this.psatService.isFieldDataFormValid(form);
    if (this.formValid) {
      this.isValid.emit(true)
    } else {
      this.isInvalid.emit(true)
    }
  }

  save() {
    this.checkForm(this.psatForm);
    this.psat.inputs = this.psatService.getPsatInputsFromForm(this.psatForm);
    this.checkWarnings();
    this.saved.emit(true);
  }

  checkWarnings(){
    this.fieldDataWarnings = this.psatWarningService.checkFieldData(this.psat, this.settings, this.baseline);
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

  isOperatingFractionDifferent() {
    if (this.canCompare()) {
      return this.compareService.isOperatingFractionDifferent();
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
