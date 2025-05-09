import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { PumpFluidService } from '../../../pump-fluid/pump-fluid.service';
import { pumpTypesConstant, driveConstants } from '../../../psatConstants';
import { PsatService } from '../../../psat.service';
import { PsatOutputs, PSAT } from '../../../../shared/models/psat';

@Component({
    selector: 'app-pump-data-form',
    templateUrl: './pump-data-form.component.html',
    styleUrls: ['./pump-data-form.component.css'],
    standalone: false
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
  baselineForm: UntypedFormGroup;
  @Input()
  modificationForm: UntypedFormGroup;
  @Input()
  psat: PSAT;

  pumpTypes: Array<{ display: string, value: number }>;
  drives: Array<{ display: string, value: number }>;
  baselinePumpEfficiency: number;
  constructor(private pumpFluidService: PumpFluidService, private psatService: PsatService, private cd: ChangeDetectorRef) {

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
        this.psat.modifications[this.exploreModIndex].exploreOppsShowMotorDrive = { hasOpportunity: false, display: 'Install More Efficient Drive' };
        this.setMotorDrive();
        this.init();
      }
    }
  }

  init() {
    this.initMotorDrive();
    this.initPumpType();
    this.calculate();
  }

  initPumpType() {
    if (this.modificationForm.controls.pumpType.value == 11) {
      if (this.modificationForm.controls.specifiedPumpEfficiency.value != this.baselinePumpEfficiency) {
        this.psat.modifications[this.exploreModIndex].exploreOppsShowPumpType = { hasOpportunity: true, display: 'Install More Efficient Pump' };
      } else {
        this.psat.modifications[this.exploreModIndex].exploreOppsShowPumpType = { hasOpportunity: false, display: 'Install More Efficient Pump' };
      }
      this.cd.detectChanges();
    } else {
      this.psat.modifications[this.exploreModIndex].exploreOppsShowPumpType = { hasOpportunity: true, display: 'Install More Efficient Pump' };
      this.cd.detectChanges();
    }
  }

  initMotorDrive() {
    if (this.baselineForm.controls.drive.value != this.modificationForm.controls.drive.value) {
      this.psat.modifications[this.exploreModIndex].exploreOppsShowMotorDrive = { hasOpportunity: true, display: 'Install More Efficient Drive' };
    } else {
      this.psat.modifications[this.exploreModIndex].exploreOppsShowMotorDrive = { hasOpportunity: false, display: 'Install More Efficient Drive' };
    }
  }

  togglePumpType() {
    if (this.psat.modifications[this.exploreModIndex].exploreOppsShowPumpType.hasOpportunity === false) {
      this.disablePumpType();
      this.calculate();
    }
  }
  toggleMotorDrive() {
    if (this.psat.modifications[this.exploreModIndex].exploreOppsShowMotorDrive.hasOpportunity === false) {
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
    this.modificationForm.controls.pumpType.patchValue(11);
    this.calculate();
  }


  getPumpEfficiency() {
    let tmpEfficiency: number = this.psatService.pumpEfficiency(this.modificationForm.controls.pumpType.value, this.psat.modifications[this.exploreModIndex].psat.inputs.flow_rate, this.psat.modifications[this.exploreModIndex].psat.inputs.pump_rated_speed, this.psat.modifications[this.exploreModIndex].psat.inputs.kinematic_viscosity, this.psat.modifications[this.exploreModIndex].psat.inputs.stages, this.psat.modifications[this.exploreModIndex].psat.inputs.head, 100, this.settings).max;
    this.modificationForm.controls.specifiedPumpEfficiency.patchValue(tmpEfficiency * 100);
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