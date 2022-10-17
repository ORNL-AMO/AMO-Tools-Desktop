import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { MotorWarnings } from '../../../psat-warning.service';
import { MotorService } from '../../../motor/motor.service';
import { UntypedFormGroup } from '@angular/forms';
import { motorEfficiencyConstants } from '../../../psatConstants';
import { PsatService } from '../../../psat.service';
import { Modification } from '../../../../shared/models/psat';
@Component({
  selector: 'app-rated-motor-form',
  templateUrl: './rated-motor-form.component.html',
  styleUrls: ['./rated-motor-form.component.css']
})
export class RatedMotorFormComponent implements OnInit {
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Input()
  baselineForm: UntypedFormGroup;
  @Input()
  modificationForm: UntypedFormGroup;
  @Input()
  baselineWarnings: MotorWarnings;
  @Input()
  modificationWarnings: MotorWarnings;
  @Input()
  currentModification: Modification;

  showEfficiencyClass: boolean = false;
  showMotorEfficiency: boolean = false;

  efficiencyClasses: Array<{ display: string, value: number }>;
  constructor(private motorService: MotorService, private psatService: PsatService) { }

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
    this.initEfficiencyClass();
    this.initMotorEfficiency();
    this.initRatedMotorData();
    this.calculate();
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

  initRatedMotorData() {
    if (this.showEfficiencyClass || this.showMotorEfficiency) {
      this.currentModification.exploreOppsShowRatedMotorData = { hasOpportunity: true, display: 'Install More Efficient Motor' };
    } else {
      this.currentModification.exploreOppsShowRatedMotorData = { hasOpportunity: false, display: 'Install More Efficient Motor' };
    }
  }

  toggleRatedMotorData() {
    if (this.currentModification.exploreOppsShowRatedMotorData.hasOpportunity == false) {
      this.showEfficiencyClass = false;
      this.showMotorEfficiency = false;
      this.toggleMotorEfficiency();
      this.toggleEfficiencyClass();
      this.toggleFLA();
    }
  }

  toggleEfficiencyClass() {
    if (this.showEfficiencyClass == false) {
      this.modificationForm.controls.efficiencyClass.patchValue(this.baselineForm.controls.efficiencyClass.value);
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
    this.modificationForm.controls.fullLoadAmps.patchValue(this.baselineForm.controls.fullLoadAmps.value);
    this.calculate();
  }

  changeBaselineEfficiencyClass() {
    this.baselineForm = this.motorService.updateFormEfficiencyValidators(this.baselineForm);
    this.calculate();
  }

  changeModificationEfficiencyClass() {
    this.modificationForm = this.motorService.updateFormEfficiencyValidators(this.modificationForm);
    this.getModificationFLA();
    this.calculate();
  }

  getModificationFLA() {
    let disableFla: boolean = this.disableFla();
    if (!disableFla) {
      this.modificationForm = this.psatService.setFormFullLoadAmps(this.modificationForm, this.settings);
    }
    this.calculate();
  }

  disableFla() {
    let disableFla: boolean = this.motorService.disableFLA(this.modificationForm);
    return disableFla;
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
}
