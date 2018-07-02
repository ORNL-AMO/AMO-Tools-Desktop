import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { GasLeakageCompareService } from "../gas-leakage-compare.service";
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

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

  openingAreaError: string = null;
  specificGravityError: string = null;
  draftPressureError: string = null;
  firstChange: boolean = true;
  temperatureError: string = null;
  constructor(private gasLeakageCompareService: GasLeakageCompareService) { }

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
    this.checkInputError(true);
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }
  focusOut() {
    this.changeField.emit('default');
  }
  disableForm() {
    // this.lossesForm.disable();
  }

  enableForm() {
    // this.lossesForm.enable();
  }

  checkInputError(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.lossesForm.controls.openingArea.value < 0) {
      this.openingAreaError = 'Opening Area must be equal or greater than 0';
    } else {
      this.openingAreaError = null;
    }
    if (this.lossesForm.controls.specificGravity.value < 0) {
      this.specificGravityError = 'Specific Density of Flue Gases must be equal or greater than 0';
    } else {
      this.specificGravityError = null;
    }
    if (this.lossesForm.controls.draftPressure.value < 0) {
      this.draftPressureError = 'Draft Pressure must be equal or greater than 0';
    } else {
      this.draftPressureError = null;
    }
    if (this.lossesForm.controls.ambientTemperature.value > this.lossesForm.controls.leakageGasTemperature.value) {
      this.temperatureError = 'Ambient Temperature is greater than Temperature of Gases Leaking';
    } else {
      this.temperatureError = null;
    }
    if(this.openingAreaError || this.specificGravityError || this.draftPressureError || this.temperatureError){
      this.inputError.emit(true);
      this.gasLeakageCompareService.inputError.next(true);
    }else{
      this.inputError.emit(false);
      this.gasLeakageCompareService.inputError.next(false);
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  startSavePolling() {
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
