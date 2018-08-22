import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { AuxiliaryPowerCompareService } from '../auxiliary-power-compare.service';
import { FormGroup } from '@angular/forms';
import { AuxiliaryPowerLossesService } from '../auxiliary-power-losses.service';
import { AuxiliaryPowerLoss } from '../../../../shared/models/phast/losses/auxiliaryPowerLoss';
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

  voltageError: string = null;

  motorPhases: Array<number> = [
    1,
    3
  ]
  constructor(private auxiliaryPowerCompareService: AuxiliaryPowerCompareService, private auxiliaryLossesService: AuxiliaryPowerLossesService) { }
  
  ngOnChanges(changes: SimpleChanges) {
    if(changes.baselineSelected){
      if(!changes.baselineSelected.firstChange){
        if (!this.baselineSelected) {
          this.disableForm();
        } else {
          this.enableForm();
        }
      }
    }
  }

  ngOnInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.checkWarnings();
  }

  disableForm() {
    this.auxLossesForm.controls.motorPhase.disable();
  }

  enableForm() {
    this.auxLossesForm.controls.motorPhase.enable();
  }


  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }

  checkWarnings(){
    let tmpLoss: AuxiliaryPowerLoss = this.auxiliaryLossesService.getLossFromForm(this.auxLossesForm);
    this.voltageError = this.auxiliaryLossesService.checkWarnings(tmpLoss);
    let errorExists: boolean = (this.voltageError !== null);
    this.inputError.emit(errorExists);
  }

  save() {
    this.checkWarnings();
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
