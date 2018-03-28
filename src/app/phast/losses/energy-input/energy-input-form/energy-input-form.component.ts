import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { EnergyInputCompareService } from '../energy-input-compare.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-energy-input-form',
  templateUrl: './energy-input-form.component.html',
  styleUrls: ['./energy-input-form.component.css']
})
export class EnergyInputFormComponent implements OnInit {
  @Input()
  energyInputForm: FormGroup;
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
  flowInput: boolean;
  firstChange: boolean = true;
  constructor(private energyInputCompareService: EnergyInputCompareService, private windowRefService: WindowRefService) { }

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
    if (this.energyInputForm.controls.flowRateInput.value) {
      this.flowInput = false;
    }

    if (!this.baselineSelected) {
      this.disableForm();
    }
  }

  setHeatInput() {
    let heatVal = this.energyInputForm.controls.flowRateInput.value * (1020 / (Math.pow(10, 6)));
    this.energyInputForm.patchValue({
      'naturalGasHeatInput': heatVal
    })
    this.startSavePolling();
  }

  disableForm() {
    this.energyInputForm.disable();
  }

  enableForm() {
    this.energyInputForm.enable();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  startSavePolling() {
    this.saveEmit.emit(true);
    this.calculate.emit(true);
  }

  showHideInputField() {
    this.flowInput = !this.flowInput;
  }
  canCompare() {
    if (this.energyInputCompareService.baselineEnergyInput && this.energyInputCompareService.modifiedEnergyInput) {
      return true;
    } else {
      return false;
    }
  }
  
  compareNaturalGasHeatInput(): boolean {
    if (this.canCompare()) {
      return this.energyInputCompareService.compareNaturalGasHeatInput(this.lossIndex);
    } else {
      return false;
    }
  }
  compareFlowRateInput(): boolean {
    if (this.canCompare()) {
      return this.energyInputCompareService.compareFlowRateInput(this.lossIndex);
    } else {
      return false;
    }
  }
  compareCoalCarbonInjection(): boolean {
    if (this.canCompare()) {
      return this.energyInputCompareService.compareCoalCarbonInjection(this.lossIndex);
    } else {
      return false;
    }
  }
  compareCoalHeatingValue(): boolean {
    if (this.canCompare()) {
      return this.energyInputCompareService.compareCoalHeatingValue(this.lossIndex);
    } else {
      return false;
    }
  }
  compareElectrodeUse(): boolean {
    if (this.canCompare()) {
      return this.energyInputCompareService.compareElectrodeUse(this.lossIndex);
    } else {
      return false;
    }
  }
  compareElectrodeHeatingValue(): boolean {
    if (this.canCompare()) {
      return this.energyInputCompareService.compareElectrodeHeatingValue(this.lossIndex);
    } else {
      return false;
    }
  }
  compareOtherFuels(): boolean {
    if (this.canCompare()) {
      return this.energyInputCompareService.compareOtherFuels(this.lossIndex);
    } else {
      return false;
    }
  }
  compareElectricityInput(): boolean {
    if (this.canCompare()) {
      return this.energyInputCompareService.compareElectricityInput(this.lossIndex);
    } else {
      return false;
    }
  }
}
