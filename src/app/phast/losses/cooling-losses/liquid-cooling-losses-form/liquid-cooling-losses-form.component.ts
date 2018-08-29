import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CoolingLossesCompareService } from '../cooling-losses-compare.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { LiquidCoolingWarnings, CoolingLossesService } from '../cooling-losses.service';
import { LiquidCoolingLoss } from '../../../../shared/models/phast/losses/coolingLoss';

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

  warnings: LiquidCoolingWarnings;
  constructor(private coolingLossesCompareService: CoolingLossesCompareService, private coolingLossesService: CoolingLossesService) { }

  ngOnInit() {
    this.checkWarnings();
  }

  checkWarnings() {
    let tmpLoss: LiquidCoolingLoss = this.coolingLossesService.initLiquidLossFromForm(this.lossesForm).liquidCoolingLoss;
    this.warnings = this.coolingLossesService.checkLiquidWarnings(tmpLoss);
    let hasWarning: boolean = this.coolingLossesService.checkWarningsExist(this.warnings);
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
