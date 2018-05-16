import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { CoolingLossesCompareService } from '../cooling-losses-compare.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-liquid-cooling-losses-form',
  templateUrl: './liquid-cooling-losses-form.component.html',
  styleUrls: ['./liquid-cooling-losses-form.component.css']
})
export class LiquidCoolingLossesFormComponent implements OnInit {
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
  
  specificHeatError: string = null;
  firstChange: boolean = true;
  temperatureError: string = null;
  densityLiquidError: string = null;
  liquidFlowError: string = null;
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
    if (this.lossesForm.controls.density.value < 0) {
      this.densityLiquidError = 'Density must be equal or greater than 0';
    } else {
      this.densityLiquidError = null;
    }
    if (this.lossesForm.controls.liquidFlow.value < 0) {
      this.liquidFlowError = 'Liquid Flow must be equal or greater than 0';
    } else {
      this.liquidFlowError = null;
    }

    if (this.lossesForm.controls.inletTemp.value > this.lossesForm.controls.outletTemp.value) {
      this.temperatureError = 'Inlet temperature is greater than outlet temperature';
    } else {
      this.temperatureError = null;
    }

    if (this.specificHeatError || this.densityLiquidError || this.liquidFlowError || this.temperatureError) {
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
    if (this.coolingLossesCompareService.baselineCoolingLosses && this.coolingLossesCompareService.modifiedCoolingLosses && !this.inSetup) {
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

  compareLiquidFlowRate(): boolean {
    if (this.canCompare()) {
      return this.coolingLossesCompareService.compareLiquidFlowRate(this.lossIndex);
    } else {
      return false;
    }
  }
  compareLiquidDensity(): boolean {
    if (this.canCompare()) {
      return this.coolingLossesCompareService.compareLiquidDensity(this.lossIndex);
    } else {
      return false;
    }
  }
  compareLiquidInitialTemperature(): boolean {
    if (this.canCompare()) {
      return this.coolingLossesCompareService.compareLiquidInitialTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareLiquidOutletTemperature(): boolean {
    if (this.canCompare()) {
      return this.coolingLossesCompareService.compareLiquidOutletTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareLiquidSpecificHeat(): boolean {
    if (this.canCompare()) {
      return this.coolingLossesCompareService.compareLiquidSpecificHeat(this.lossIndex);
    } else {
      return false;
    }
  }
  compareLiquidCorrectionFactor(): boolean {
    if (this.canCompare()) {
      return this.coolingLossesCompareService.compareLiquidCorrectionFactor(this.lossIndex);
    } else {
      return false;
    }
  }
}
