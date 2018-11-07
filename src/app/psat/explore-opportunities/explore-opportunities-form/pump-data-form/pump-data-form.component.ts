import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { PumpFluidService } from '../../../pump-fluid/pump-fluid.service';
import { pumpTypesConstant, driveConstants } from '../../../psatConstants';

@Component({
  selector: 'app-pump-data-form',
  templateUrl: './pump-data-form.component.html',
  styleUrls: ['./pump-data-form.component.css']
})
export class PumpDataFormComponent implements OnInit {
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Input()
  isVFD: boolean;
  @Input()
  baselineForm: FormGroup;
  @Input()
  modificationForm: FormGroup;

  showPumpData: boolean = false;
  showPumpType: boolean = false;
  showMotorDrive: boolean = false;
  showPumpSpecified: boolean = false;

  pumpTypes: Array<{ display: string, value: number }>;
  drives: Array<{ display: string, value: number }>;
  constructor(private pumpFluidService: PumpFluidService) {

  }

  ngOnInit() {
    this.pumpTypes = pumpTypesConstant;
    this.drives = driveConstants;
    this.init();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.init()
      }
    }
  }

  init() {
    // this.baselineForm = this.pumpFluidService.getFormFromObj(this.psat.inputs);
    // this.baselineForm.disable();
    // this.modificationForm = this.pumpFluidService.getFormFromObj(this.psat.modifications[this.exploreModIndex].psat.inputs);
    this.initPumpSpecifiedEfficiency();
    this.initMotorDrive();
    this.initPumpType();
    this.initPumpData();
  }

  initPumpType() {
    if (this.baselineForm.controls.pumpType.value != this.modificationForm.controls.pumpType.value) {
      this.showPumpType = true;
    } else {
      this.showPumpType = false;
    }
  }

  initMotorDrive() {
    if (this.baselineForm.controls.drive.value != this.modificationForm.controls.drive.value) {
      this.showMotorDrive = true;
    } else {
      this.showMotorDrive = false;
    }
  }

  initPumpSpecifiedEfficiency() {
    if (this.baselineForm.controls.specifiedPumpEfficiency.value != this.modificationForm.controls.specifiedPumpEfficiency.value) {
      this.showPumpSpecified = true;
    } else {
      this.showPumpSpecified = false;
    }

  }

  initPumpData() {
    if (this.showMotorDrive || this.showPumpSpecified || this.showPumpType) {
      this.showPumpData = true;
    } else {
      this.showPumpData = false;
    }
  }

  togglePumpData() {
    if (this.showPumpData == false) {
      this.showPumpSpecified = false;
      this.showPumpType = false;
      this.showMotorDrive = false;
      this.togglePumpSpecifiedEfficiency();
      this.togglePumpType();
      this.toggleMotorDrive();
    }
  }
  togglePumpSpecifiedEfficiency() {
    if (this.showPumpSpecified == false) {
      this.modificationForm.controls.specifiedPumpEfficiency.patchValue(this.baselineForm.controls.specifiedPumpEfficiency.value);
      this.calculate();
    }
  }

  togglePumpType() {
    if (this.showPumpType == false) {
      this.modificationForm.controls.pumpType.patchValue(this.baselineForm.controls.pumpType.value);
      this.calculate();
    }
  }
  toggleMotorDrive() {
    if (this.showMotorDrive === false) {
      this.modificationForm.controls.drive.patchValue(this.baselineForm.controls.drive.value);
      this.calculate();
    }
  }

  setPumpTypes() {
    //only needed if we allow modifiying baseline
    //this.baselineForm = this.pumpFluidService.updateSpecifiedPumpEfficiency(this.baselineForm);
    this.modificationForm = this.pumpFluidService.updateSpecifiedPumpEfficiency(this.modificationForm);
    this.calculate();
  }

  setMotorDrive() {
    //only needed if we allow modifiying baseline
    //this.baselineForm = this.pumpFluidService.updateSpecifiedPumpEfficiency(this.baselineForm);
    this.modificationForm = this.pumpFluidService.updateSpecifiedDriveEfficiency(this.modificationForm);
    this.calculate();
  }

  calculate() {
    //only needed if we allow modifying baseline
    // this.psat.inputs = this.pumpFluidService.getPsatInputsFromForm(this.modificationForm, this.psat.inputs);
    // this.psat.modifications[this.exploreModIndex].psat.inputs = this.pumpFluidService.getPsatInputsFromForm(this.modificationForm, this.psat.modifications[this.exploreModIndex].psat.inputs);
    this.emitCalculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
}