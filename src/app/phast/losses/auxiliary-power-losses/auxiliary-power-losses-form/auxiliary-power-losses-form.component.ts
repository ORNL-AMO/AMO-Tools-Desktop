import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { AuxiliaryPowerCompareService } from '../auxiliary-power-compare.service';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-auxiliary-power-losses-form',
  templateUrl: './auxiliary-power-losses-form.component.html',
  styleUrls: ['./auxiliary-power-losses-form.component.css']
})
export class AuxiliaryPowerLossesFormComponent implements OnInit {
  @Input()
  auxLossesForm: FormGroup;
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
  @Output('inputError')
  inputError = new EventEmitter<boolean>();
  @Input()
  inSetup: boolean;

  firstChange: boolean = true;
  voltageError: string = null;

  motorPhases: Array<number> = [
    1,
    3
  ]
  constructor(private windowRefService: WindowRefService, private auxiliaryPowerCompareService: AuxiliaryPowerCompareService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (!this.baselineSelected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    } else {
      this.firstChange = false;
    }
  }

  ngOnInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }

  disableForm() {
    // this.auxLossesForm.disable();
  }

  enableForm() {
    // this.auxLossesForm.enable();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }

  checkVoltageError(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.auxLossesForm.controls.supplyVoltage.value < 0 || this.auxLossesForm.controls.supplyVoltage.value > 480) {
      this.voltageError = 'Supply Voltage must be between 0 and 480';
    } else {
      this.voltageError = null;
    }

    if (this.voltageError) {
      this.inputError.emit(true);
    } else {
      this.inputError.emit(false);
    }
  }

  startSavePolling() {
    this.saveEmit.emit(true);
    this.calculate.emit(true);
  }

  canCompare() {
    if (this.auxiliaryPowerCompareService.baselineAuxLosses && this.auxiliaryPowerCompareService.modifiedAuxLosses && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  compareMotorPhase(): boolean {
    if (this.canCompare()) {
      return this.auxiliaryPowerCompareService.compareMotorPhase(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSupplyVoltage(): boolean {
    if (this.canCompare()) {
      return this.auxiliaryPowerCompareService.compareSupplyVoltage(this.lossIndex);
    } else {
      return false;
    }
  }
  compareAvgCurrent(): boolean {
    if (this.canCompare()) {
      return this.auxiliaryPowerCompareService.compareAvgCurrent(this.lossIndex);
    } else {
      return false;
    }
  }
  comparePowerFactor(): boolean {
    if (this.canCompare()) {
      return this.auxiliaryPowerCompareService.comparePowerFactor(this.lossIndex);
    } else {
      return false;
    }
  }
  compareOperatingTime(): boolean {
    if (this.canCompare()) {
      return this.auxiliaryPowerCompareService.compareOperatingTime(this.lossIndex);
    } else {
      return false;
    }
  }
}
