import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { PumpFluidService } from '../../../pump-fluid/pump-fluid.service';
import { pumpTypesConstant, driveConstants } from '../../../psatConstants';
import { PsatService } from '../../../psat.service';
import { PsatOutputs, PSAT } from '../../../../shared/models/psat';

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
  @Input()
  psat: PSAT;

  showPumpType: boolean = false;
  showMotorDrive: boolean = false;

  pumpTypes: Array<{ display: string, value: number }>;
  drives: Array<{ display: string, value: number }>;
  baselinePumpEfficiency: number;
  constructor(private pumpFluidService: PumpFluidService, private psatService: PsatService) {

  }

  ngOnInit() {
    this.pumpTypes = JSON.parse(JSON.stringify(pumpTypesConstant));
    this.pumpTypes.pop();
    this.drives = JSON.parse(JSON.stringify(driveConstants));
    let tmpResults: PsatOutputs = this.psatService.resultsExisting(this.psat.inputs, this.settings);
    this.baselinePumpEfficiency = tmpResults.pump_efficiency;
    this.init();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.init()
      }
    }

    if (changes.isVFD && !changes.isVFD.isFirstChange()) {
      if (this.isVFD == true) {
        this.modificationForm.controls.drive.patchValue(4);
        this.setMotorDrive();
      } else {
        this.modificationForm.controls.drive.patchValue(this.baselineForm.controls.drive.value);
        this.showMotorDrive = false;
        this.setMotorDrive();
        this.init();
      }
    }
  }

  init() {
    this.initMotorDrive();
    this.initPumpType();
  }

  initPumpType() {

    if (this.modificationForm.controls.pumpType.value == 11) {
      this.modificationForm.controls.pumpType.disable();
      if (this.modificationForm.controls.specifiedPumpEfficiency.value != this.baselinePumpEfficiency) {
        this.showPumpType = true;
      }
    } else {
      this.showPumpType = true;
      this.modificationForm.controls.specifiedPumpEfficiency.disable();
    }
  }

  initMotorDrive() {
    if (this.baselineForm.controls.drive.value != this.modificationForm.controls.drive.value) {
      this.showMotorDrive = true;
    } else {
      this.showMotorDrive = false;
    }
  }

  togglePumpType() {
    if (this.showPumpType == false) {
      this.disablePumpType();
      this.calculate();
    }
  }
  toggleMotorDrive() {
    if (this.showMotorDrive === false) {
      this.modificationForm.controls.drive.patchValue(this.baselineForm.controls.drive.value);
      this.calculate();
    }
  }

  enablePumpType() {
    this.modificationForm.controls.pumpType.patchValue(this.baselineForm.controls.pumpType.value);
    this.modificationForm.controls.pumpType.enable();
    this.getPumpEfficiency();
  }

  disablePumpType() {
    this.modificationForm.controls.specifiedPumpEfficiency.patchValue(this.baselinePumpEfficiency);
    this.modificationForm.controls.specifiedPumpEfficiency.enable();
    this.modificationForm.controls.pumpType.patchValue(11);
    this.modificationForm.controls.pumpType.disable();
    this.calculate();
  }


  getPumpEfficiency() {
    let tmpEfficiency: number = this.psatService.pumpEfficiency(this.modificationForm.controls.pumpType.value, this.psat.modifications[this.exploreModIndex].psat.inputs.flow_rate, this.settings).max;
    this.modificationForm.controls.specifiedPumpEfficiency.patchValue(tmpEfficiency);
    this.modificationForm.controls.specifiedPumpEfficiency.disable();
    this.calculate();
  }

  setPumpTypes() {
    //only needed if we allow modifiying baseline
    //this.baselineForm = this.pumpFluidService.updateSpecifiedPumpEfficiency(this.baselineForm);
    this.modificationForm = this.pumpFluidService.updateSpecifiedPumpEfficiency(this.modificationForm);
    this.getPumpEfficiency();
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