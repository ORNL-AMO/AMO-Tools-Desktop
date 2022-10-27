import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CoolingLossesCompareService } from '../cooling-losses-compare.service';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { GasCoolingLoss } from '../../../../shared/models/phast/losses/coolingLoss';
import { CoolingFormService, GasCoolingWarnings } from '../../../../calculator/furnaces/cooling/cooling-form.service';

@Component({
  selector: 'app-gas-cooling-losses-form',
  templateUrl: './gas-cooling-losses-form.component.html',
  styleUrls: ['./gas-cooling-losses-form.component.css']
})
export class GasCoolingLossesFormComponent implements OnInit {
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

  warnings: GasCoolingWarnings;
  idString: string;
  constructor(private coolingLossesCompareService: CoolingLossesCompareService, private coolingFormService: CoolingFormService) { }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.lossIndex;
    }
    else {
      this.idString = '_baseline_' + this.lossIndex;
    }
    this.checkWarnings();
  }

  checkWarnings() {
    let tmpLoss: GasCoolingLoss = this.coolingFormService.initGasLossFromForm(this.lossesForm).gasCoolingLoss;
    this.warnings = this.coolingFormService.checkGasWarnings(tmpLoss);
    let hasWarning: boolean = this.coolingFormService.checkWarningsExist(this.warnings);
    this.inputError.emit(hasWarning);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }
  save() {
    this.checkWarnings();
    this.saveEmit.emit(true);
    this.calculate.emit(true);
  }
  canCompare() {
    if (this.coolingLossesCompareService.baselineCoolingLosses && this.coolingLossesCompareService.modifiedCoolingLosses && !this.inSetup) {
      if (this.coolingLossesCompareService.compareLossType(this.lossIndex) === false) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  compareCoolingMedium(): boolean {
    if (this.canCompare()) {
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
