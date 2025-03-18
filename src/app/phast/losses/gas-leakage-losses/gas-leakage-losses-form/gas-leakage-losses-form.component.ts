import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { GasLeakageCompareService } from "../gas-leakage-compare.service";
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { LeakageLoss } from '../../../../shared/models/phast/losses/leakageLoss';
import { LeakageFormService, LeakageWarnings } from '../../../../calculator/furnaces/leakage/leakage-form.service';

@Component({
    selector: 'app-gas-leakage-losses-form',
    templateUrl: './gas-leakage-losses-form.component.html',
    styleUrls: ['./gas-leakage-losses-form.component.css'],
    standalone: false
})
export class GasLeakageLossesFormComponent implements OnInit {
  @Input()
  lossesForm: UntypedFormGroup;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();
  @Input()
  lossIndex: number;
  @Input()
  settings: Settings;
  @Output('inputError')
  inputError = new EventEmitter<boolean>();
  @Input()
  inSetup: boolean;
  @Input()
  isBaseline: boolean;

  warnings: LeakageWarnings;
  idString: string;
  constructor(private gasLeakageCompareService: GasLeakageCompareService, private leakageFormService: LeakageFormService) { }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.lossIndex;
    }
    else {
      this.idString = '_baseline_' + this.lossIndex;
    }
    this.checkWarnings();
  }

  focusOut() {
    this.changeField.emit('default');
  }

  checkWarnings() {
    let tmpLoss: LeakageLoss = this.leakageFormService.initLossFromForm(this.lossesForm);
    this.warnings = this.leakageFormService.checkLeakageWarnings(tmpLoss);
    let hasWarning: boolean = this.leakageFormService.checkWarningsExist(this.warnings);
    this.inputError.emit(hasWarning);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  save() {
    this.checkWarnings();
    this.saveEmit.emit(true);
    this.calculate.emit(true);
  }

  canCompare() {
    if (this.gasLeakageCompareService.baselineLeakageLoss && this.gasLeakageCompareService.modifiedLeakageLoss && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }
  compareDraftPressure(): boolean {
    if (this.canCompare()) {
      return this.gasLeakageCompareService.compareDraftPressure(this.lossIndex);
    } else {
      return false;
    }
  }
  compareOpeningArea(): boolean {
    if (this.canCompare()) {
      return this.gasLeakageCompareService.compareOpeningArea(this.lossIndex);
    } else {
      return false;
    }
  }
  compareLeakageGasTemperature(): boolean {
    if (this.canCompare()) {
      return this.gasLeakageCompareService.compareLeakageGasTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareAmbientTemperature(): boolean {
    if (this.canCompare()) {
      return this.gasLeakageCompareService.compareAmbientTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSpecificGravity(): boolean {
    if (this.canCompare()) {
      return this.gasLeakageCompareService.compareSpecificGravity(this.lossIndex);
    } else {
      return false;
    }
  }

}
