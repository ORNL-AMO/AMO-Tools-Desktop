import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { EnergyInputExhaustGasCompareService } from '../energy-input-exhaust-gas-compare.service';
import { EnergyInputExhaustGasService } from '../energy-input-exhaust-gas.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { EnergyInputExhaustGasLoss } from '../../../../shared/models/phast/losses/energyInputExhaustGasLosses';

@Component({
  selector: 'app-energy-input-exhaust-gas-form',
  templateUrl: './energy-input-exhaust-gas-form.component.html',
  styleUrls: ['./energy-input-exhaust-gas-form.component.css']
})
export class EnergyInputExhaustGasFormComponent implements OnInit {
  @Input()
  exhaustGasForm: FormGroup;
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
  availableHeat: number;
  @Output('inputError')
  inputError = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  inSetup: boolean;
  @Input()
  isBaseline: boolean;

  combustionTempWarning: string = null;
  heatWarning: string = null;
  firstChange: boolean = true;
  idString: string;
  constructor(private energyInputExhaustGasCompareService: EnergyInputExhaustGasCompareService, private energyInputExhaustGasService: EnergyInputExhaustGasService) { }

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
    let tmpExhaustGas: EnergyInputExhaustGasLoss = this.energyInputExhaustGasService.getLossFromForm(this.exhaustGasForm);
    let tmpWarnings: { combustionTempWarning: string, heatWarning: string } = this.energyInputExhaustGasService.checkWarnings(tmpExhaustGas, this.settings);
    this.combustionTempWarning = tmpWarnings.combustionTempWarning;
    this.heatWarning = tmpWarnings.heatWarning;
    let hasWarning: boolean = ((this.heatWarning !== null) || (this.combustionTempWarning !== null));
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
    if (this.energyInputExhaustGasCompareService.baselineEnergyInputExhaustGasLosses && this.energyInputExhaustGasCompareService.modifiedEnergyInputExhaustGasLosses && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }
  compareExcessAir(): boolean {
    if (this.canCompare()) {
      return this.energyInputExhaustGasCompareService.compareExcessAir(this.lossIndex);
    } else {
      return false;
    }
  }

  compareCombustionAirTemp(): boolean {
    if (this.canCompare()) {
      return this.energyInputExhaustGasCompareService.compareCombustionAirTemp(this.lossIndex);
    } else {
      return false;
    }
  }
  compareExhaustGasTemp(): boolean {
    if (this.canCompare()) {
      return this.energyInputExhaustGasCompareService.compareExhaustGasTemp(this.lossIndex);
    } else {
      return false;
    }
  }
  compareTotalHeatInput(): boolean {
    if (this.canCompare()) {
      return this.energyInputExhaustGasCompareService.compareTotalHeatInput(this.lossIndex);
    } else {
      return false;
    }
  }
}
