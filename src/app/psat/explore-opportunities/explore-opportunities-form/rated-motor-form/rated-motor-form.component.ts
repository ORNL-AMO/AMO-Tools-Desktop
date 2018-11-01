import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PSAT } from '../../../../shared/models/psat';
import { Settings } from '../../../../shared/models/settings';
import { PsatWarningService, MotorWarnings } from '../../../psat-warning.service';
import { MotorService } from '../../../motor/motor.service';
import { FormGroup } from '@angular/forms';
import { motorEfficiencyConstants } from '../../../psatConstants';
@Component({
  selector: 'app-rated-motor-form',
  templateUrl: './rated-motor-form.component.html',
  styleUrls: ['./rated-motor-form.component.css']
})
export class RatedMotorFormComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;

  showRatedMotorPower: boolean = false;
  showEfficiencyClass: boolean = false;
  showRatedMotorData: boolean = false;
  showMotorEfficiency: boolean = false;
  showFLA: boolean = false;

  efficiencyClasses: Array<{ display: string, value: number }>;
  baselineForm: FormGroup;
  modificationForm: FormGroup;

  baselineWarnings: MotorWarnings;
  modificationWarnings: MotorWarnings;
  constructor(private psatWarningService: PsatWarningService, private motorService: MotorService) { }

  ngOnInit() {
    this.efficiencyClasses = motorEfficiencyConstants;
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
    this.baselineForm = this.motorService.getFormFromObj(this.psat.inputs);
    this.baselineForm.disable();
    this.modificationForm = this.motorService.getFormFromObj(this.psat.modifications[this.exploreModIndex].psat.inputs);
    this.initEfficiencyClass();
    this.initMotorEfficiency();
    this.initRatedMotorPower();
    this.initFLA();
    this.initRatedMotorData();
    this.checkWarnings();
  }

  initEfficiencyClass() {
    if (this.baselineForm.controls.efficiencyClass.value != this.modificationForm.controls.efficiencyClass.value) {
      this.showEfficiencyClass = true;
    } else {
      this.showEfficiencyClass = false;
    }
  }

  initMotorEfficiency() {
    if (this.baselineForm.controls.efficiency.value != this.modificationForm.controls.efficiency.value) {
      this.showMotorEfficiency = true;
    } else {
      this.showMotorEfficiency = false;
    }
  }

  initRatedMotorPower() {
    if (this.baselineForm.controls.horsePower.value != this.modificationForm.controls.horsePower.value) {
      this.showRatedMotorPower = true;
    } else {
      this.showRatedMotorPower = false;
    }
  }

  initFLA() {
    if (this.baselineForm.controls.fullLoadAmps.value != this.modificationForm.controls.fullLoadAmps.value) {
      this.showFLA = true;
    } else {
      this.showFLA = false;
    }
  }

  initRatedMotorData() {
    if (this.showEfficiencyClass || this.showMotorEfficiency || this.showRatedMotorPower || this.showFLA) {
      this.showRatedMotorData = true;
    } else {
      this.showRatedMotorData = false;
    }
  }

  toggleRatedMotorData() {
    if (this.showRatedMotorData == false) {
      this.showRatedMotorPower = false;
      this.showEfficiencyClass = false;
      this.showMotorEfficiency = false;
      this.toggleMotorEfficiency();
      this.toggleEfficiencyClass();
      this.toggleMotorRatedPower();
      this.toggleFLA();
    }
  }

  toggleMotorRatedPower() {
    if (this.showRatedMotorPower == false) {
      this.modificationForm.controls.horsePower.patchValue(this.baselineForm.controls.horsePower.value);
      this.calculate();
    }
  }

  toggleEfficiencyClass() {
    if (this.showEfficiencyClass == false) {
      this.modificationForm.controls.horsePower.patchValue(this.baselineForm.controls.horsePower.value);
      this.calculate();
    }
  }

  toggleMotorEfficiency() {
    if (this.showMotorEfficiency == false) {
      this.modificationForm.controls.efficiency.patchValue(this.baselineForm.controls.efficiency.value);
      this.calculate();
    }
  }

  toggleFLA() {
    if (this.showFLA == false) {
      this.modificationForm.controls.fullLoadAmps.patchValue(this.baselineForm.controls.fullLoadAmps.value);
      this.calculate();
    }
  }

  changeBaselineEfficiencyClass() {
    this.baselineForm = this.motorService.updateFormEfficiencyValidators(this.baselineForm);
    this.calculate();
  }

  changeModificationEfficiencyClass() {
    this.modificationForm = this.motorService.updateFormEfficiencyValidators(this.modificationForm);
    this.calculate();
  }

  getModificationFLA() {
    let disableFla: boolean = this.disableFla();
    if (!disableFla) {
      this.motorService.setFormFullLoadAmps(this.modificationForm, this.settings);
    }
    this.calculate();
  }

  disableFla() {
    let disableFla: boolean = this.motorService.disableFLA(this.modificationForm);
    return disableFla;
  }

  checkWarnings() {
    this.baselineWarnings = this.psatWarningService.checkMotorWarnings(this.psat, this.settings);
    this.modificationWarnings = this.psatWarningService.checkMotorWarnings(this.psat.modifications[this.exploreModIndex].psat, this.settings);
  }

  calculate() {
    //only needed if we enable changing baseline
    // this.psat.inputs = this.motorService.getInputsFromFrom(this.baselineForm, this.psat.inputs);
    this.psat.modifications[this.exploreModIndex].psat.inputs = this.motorService.getInputsFromFrom(this.modificationForm, this.psat.modifications[this.exploreModIndex].psat.inputs);
    this.checkWarnings();
    this.emitCalculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
}
