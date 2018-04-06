import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { CoolingLossesCompareService } from '../cooling-losses-compare.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-gas-cooling-losses-form',
  templateUrl: './gas-cooling-losses-form.component.html',
  styleUrls: ['./gas-cooling-losses-form.component.css']
})
export class GasCoolingLossesFormComponent implements OnInit {
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

  specificHeatError: string = null;
  gasFlowError: string = null;
  gasDensityError: string = null;
  firstChange: boolean = true;
  temperatureError: string = null;
  constructor(private coolingLossesCompareService: CoolingLossesCompareService) { }

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
    if (this.lossesForm.controls.avgSpecificHeat.value < 0) {
      this.specificHeatError = 'Specific Heat must be equal or greater than 0';
    } else {
      this.specificHeatError = null;
    }
    if (this.lossesForm.controls.gasFlow.value < 0) {
      this.gasFlowError = 'Gas Flow must be equal or greater than 0';
    } else {
      this.gasFlowError = null;
    }
    if (this.lossesForm.controls.gasDensity.value < 0) {
      this.gasDensityError = 'Gas Density must be equal or greater than 0';
    } else {
      this.gasDensityError = null;
    }
    if (this.lossesForm.controls.inletTemp.value > this.lossesForm.controls.outletTemp.value) {
      this.temperatureError = 'Inlet temperature is greater than outlet temperature'
    } else {
      this.temperatureError = null;
    }

    if (this.specificHeatError || this.gasFlowError || this.gasDensityError || this.temperatureError) {
      this.inputError.emit(true);
      this.coolingLossesCompareService.inputError.next(true);
    } else {
      this.inputError.emit(false);
      this.coolingLossesCompareService.inputError.next(false);
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }
  startSavePolling() {
    this.saveEmit.emit(true);
    this.calculate.emit(true)
  }
  canCompare() {
    if (this.coolingLossesCompareService.baselineCoolingLosses && this.coolingLossesCompareService.modifiedCoolingLosses) {
      if (this.coolingLossesCompareService.compareLossType(this.lossIndex) == false) {
        return true
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  compareCoolingMedium(): boolean {
    if (this.coolingLossesCompareService.baselineCoolingLosses && this.coolingLossesCompareService.modifiedCoolingLosses) {
      return this.coolingLossesCompareService.compareCoolingMedium(this.lossIndex);
    } else {
      return false;
    }
  }

  compareGasFlowRate(): boolean {
    if (this.canCompare()) {
      return this.coolingLossesCompareService.compareGasFlowRate(this.lossIndex);
    } else {
      return false;
    }
  }
  compareGasInitialTemperature(): boolean {
    if (this.canCompare()) {
      return this.coolingLossesCompareService.compareGasInitialTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareGasFinalTemperature(): boolean {
    if (this.canCompare()) {
      return this.coolingLossesCompareService.compareGasFinalTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareGasSpecificHeat(): boolean {
    if (this.canCompare()) {
      return this.coolingLossesCompareService.compareGasSpecificHeat(this.lossIndex);
    } else {
      return false;
    }
  }
  compareGasCorrectionFactor(): boolean {
    if (this.canCompare()) {
      return this.coolingLossesCompareService.compareGasCorrectionFactor(this.lossIndex);
    } else {
      return false;
    }
  }
  compareGasDensity(): boolean {
    if (this.canCompare()) {
      return this.coolingLossesCompareService.compareGasDensity(this.lossIndex);
    } else {
      return false;
    }
  }

}
