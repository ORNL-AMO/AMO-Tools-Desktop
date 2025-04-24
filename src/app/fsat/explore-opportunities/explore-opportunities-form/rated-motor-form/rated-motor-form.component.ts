import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT } from '../../../../shared/models/fans';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { HelpPanelService } from '../../../help-panel/help-panel.service';
import { ModifyConditionsService } from '../../../modify-conditions/modify-conditions.service';
import { PsatService } from '../../../../psat/psat.service';
import { UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { FanMotorService } from '../../../fan-motor/fan-motor.service';
import { motorEfficiencyConstants } from '../../../../psat/psatConstants';

@Component({
    selector: 'app-rated-motor-form',
    templateUrl: './rated-motor-form.component.html',
    styleUrls: ['./rated-motor-form.component.css'],
    standalone: false
})
export class RatedMotorFormComponent implements OnInit {
  @Input()
  fsat: FSAT;
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  baselineForm: UntypedFormGroup;
  @Input()
  modificationForm: UntypedFormGroup;

  efficiencyClasses: Array<{ value: number, display: string }>;
  constructor(
    private convertUnitsService: ConvertUnitsService,
    private psatService: PsatService,
    private helpPanelService: HelpPanelService,
    private modifyConditionsService: ModifyConditionsService,
    private fanMotorService: FanMotorService) { }

  ngOnInit() {
    this.efficiencyClasses = motorEfficiencyConstants;
    this.init();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.init();
      }
    }
  }

  init() {
    this.initEfficiencyClass();
    this.initMotorEfficiency();
  }

  initEfficiencyClass() {
    if (this.baselineForm.controls.efficiencyClass.value !== this.modificationForm.controls.efficiencyClass.value) {
      this.fsat.modifications[this.exploreModIndex].exploreOppsShowMotor = {hasOpportunity: true, display: "Install More Efficient Motor"};
    } else {
      this.fsat.modifications[this.exploreModIndex].exploreOppsShowMotor = {hasOpportunity: false, display: "Install More Efficient Motor"};
    }
  }

  initMotorEfficiency() {
    if (this.modificationForm.controls.efficiencyClass.value === 3) {
      this.fsat.modifications[this.exploreModIndex].exploreOppsShowMotorEff = {hasOpportunity: true, display: "Modified Motor Efficiency"};
      this.modificationForm.controls.specifiedEfficiency.enable();
    } else {
      this.modificationForm.controls.specifiedEfficiency.patchValue(90);
      this.modificationForm.controls.specifiedEfficiency.disable();
    }
    if (this.baselineForm.controls.efficiencyClass.value === 3) {
      this.fsat.modifications[this.exploreModIndex].exploreOppsShowMotorEff = {hasOpportunity: true, display: "Modified Motor Efficiency"};
    } else {
      this.baselineForm.controls.specifiedEfficiency.patchValue(90);

    }

    if (this.baselineForm.controls.efficiencyClass.value !== 3 && this.modificationForm.controls.efficiencyClass.value !== 3) {
      this.fsat.modifications[this.exploreModIndex].exploreOppsShowMotorEff = {hasOpportunity: false, display: "Modified Motor Efficiency"};
    }
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
    this.modifyConditionsService.modifyConditionsTab.next('fan-motor');
  }

  getUnit(unit: string) {
    let tmpUnit = this.convertUnitsService.getUnit(unit);
    let dsp = tmpUnit.unit.name.display.replace('(', '');
    dsp = dsp.replace(')', '');
    return dsp;

  }

  setEfficiencyClasses() {
    this.initMotorEfficiency();
    let tmpEfficiencyValidators: Array<ValidatorFn> = this.fanMotorService.getEfficiencyValidators(this.modificationForm.controls.efficiencyClass.value);
    this.modificationForm.controls.efficiencyClass.setValidators(tmpEfficiencyValidators);
    this.modificationForm.controls.efficiencyClass.reset(this.modificationForm.controls.efficiencyClass.value);
    this.modificationForm.controls.efficiencyClass.markAsDirty();

    tmpEfficiencyValidators = this.fanMotorService.getEfficiencyValidators(this.baselineForm.controls.efficiencyClass.value);
    this.baselineForm.controls.efficiencyClass.setValidators(tmpEfficiencyValidators);
    this.baselineForm.controls.efficiencyClass.reset(this.baselineForm.controls.efficiencyClass.value);
    this.baselineForm.controls.efficiencyClass.markAsDirty();
    this.calculate();
  }

  toggleEfficiencyClass() {
    if (this.fsat.modifications[this.exploreModIndex].exploreOppsShowMotor.hasOpportunity === false) {
      this.modificationForm.controls.efficiencyClass.patchValue(this.baselineForm.controls.efficiencyClass.value);
      this.calculate();
    }
  }
  toggleMotorEfficiency() {
    if (this.fsat.modifications[this.exploreModIndex].exploreOppsShowMotorEff.hasOpportunity === false) {
      this.modificationForm.controls.specifiedEfficiency.patchValue(this.baselineForm.controls.specifiedEfficiency.value);
      this.calculate();
    }
  }

  disableModifiedFLA() {
    if (
      this.modificationForm.controls.motorRatedPower.valid &&
      this.modificationForm.controls.motorRpm.valid &&
      this.modificationForm.controls.lineFrequency.valid &&
      this.modificationForm.controls.efficiencyClass.valid &&
      this.modificationForm.controls.motorRatedVoltage.valid
    ) {
      return false;
    } else {
      return true;
    }
  }

  getModificationFLA() {
    if (
      !this.disableModifiedFLA()
    ) {
      if (!this.modificationForm.controls.specifiedEfficiency.value) {
        this.modificationForm.controls.specifiedEfficiency.patchValue(90);
      }
      let estEfficiency = this.psatService.estFLA(
        this.modificationForm.controls.motorRatedPower.value,
        this.modificationForm.controls.motorRpm.value,
        this.modificationForm.controls.lineFrequency.value,
        this.modificationForm.controls.efficiencyClass.value,
        this.modificationForm.controls.specifiedEfficiency.value,
        this.modificationForm.controls.motorRatedVoltage.value,
        this.settings
      );
      this.modificationForm.controls.fullLoadAmps.patchValue(estEfficiency);
    }
    this.calculate();
  }
}
