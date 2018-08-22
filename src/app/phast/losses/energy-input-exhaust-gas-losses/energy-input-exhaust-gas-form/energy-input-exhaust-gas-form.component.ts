import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { EnergyInputExhaustGasCompareService } from '../energy-input-exhaust-gas-compare.service';
import { FormControl, Validators } from '@angular/forms'
import * as _ from 'lodash';
//used for other loss monitoring
import { EnergyInputExhaustGasService } from '../energy-input-exhaust-gas.service';
import { PhastService } from '../../../phast.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

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
  

  combustionTempError: string = null;
  heatError: string = null;
  firstChange: boolean = true;
  constructor(private windowRefService: WindowRefService, private energyInputExhaustGasCompareService: EnergyInputExhaustGasCompareService, private energyInputExhaustGasService: EnergyInputExhaustGasService, private phastService: PhastService) { }

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
    this.checkHeat(true);
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }

  checkHeat(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.settings.unitsOfMeasure === 'Imperial') {
      if (this.exhaustGasForm.controls.totalHeatInput.value > 0 && this.exhaustGasForm.controls.exhaustGasTemp.value < 40) {
        this.heatError = 'Exhaust Gas Temperature cannot be less than 40 ';
      } else {
        this.heatError = null;
      }
    }
    if (this.settings.unitsOfMeasure === 'Metric') {
      if (this.exhaustGasForm.controls.totalHeatInput.value > 0 && this.exhaustGasForm.controls.exhaustGasTemp.value < 4) {
        this.heatError = 'Exhaust Gas Temperature cannot be less than 4 ';
      } else {
        this.heatError = null;
      }
    }

    if (this.exhaustGasForm.controls.totalHeatInput.value > 0 && this.exhaustGasForm.controls.combustionAirTemp.value >= this.exhaustGasForm.controls.exhaustGasTemp.value) {
      this.combustionTempError = 'Combustion air temperature must be less than exhaust gas temperature';
    }
    else {
      this.combustionTempError = null;
    }

    if (this.combustionTempError || this.heatError) {
      this.inputError.emit(true);
      this.energyInputExhaustGasCompareService.inputError.next(true);
    } else {
      this.inputError.emit(false);
      this.energyInputExhaustGasCompareService.inputError.next(false);
    }
  }

  disableForm() {
    // this.exhaustGasForm.disable();
  }

  enableForm() {
    // this.exhaustGasForm.enable();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }

  startSavePolling() {
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
  compareElectricalPowerInput(): boolean {
    if (this.canCompare()) {
      return this.energyInputExhaustGasCompareService.compareElectricalPowerInput(this.lossIndex);
    } else {
      return false;
    }
  }
}
