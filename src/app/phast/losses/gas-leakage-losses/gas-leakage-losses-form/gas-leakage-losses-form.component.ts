import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { GasLeakageCompareService } from "../gas-leakage-compare.service";
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { GasLeakageLossesService, LeakageWarnings } from '../gas-leakage-losses.service';
import { LeakageLoss } from '../../../../shared/models/phast/losses/leakageLoss';

@Component({
  selector: 'app-gas-leakage-losses-form',
  templateUrl: './gas-leakage-losses-form.component.html',
  styleUrls: ['./gas-leakage-losses-form.component.css']
})
export class GasLeakageLossesFormComponent implements OnInit {
  @Input()
  lossesForm: FormGroup;
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

  warnings: LeakageWarnings;
  constructor(private gasLeakageCompareService: GasLeakageCompareService, private gasLeakageLossesService: GasLeakageLossesService) { }

  ngOnInit() {
    this.checkWarnings();
  }

  focusOut() {
    this.changeField.emit('default');
  }

  checkWarnings() {
    let tmpLoss: LeakageLoss = this.gasLeakageLossesService.initLossFromForm(this.lossesForm);
    this.warnings = this.gasLeakageLossesService.checkLeakageWarnings(tmpLoss);
    let hasWarning: boolean = this.gasLeakageLossesService.checkWarningsExist(this.warnings);
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
