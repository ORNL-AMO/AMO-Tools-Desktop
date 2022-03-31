import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EnergyInputCompareService } from '../energy-input-compare.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { EnergyInputService } from '../energy-input.service';

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
  @Input()
  inSetup: boolean;
  @Input()
  isBaseline: boolean;
  @Input()
  electricityInputWarning: string;

  flowInput: boolean;
  idString: string;
  constructor(private energyInputCompareService: EnergyInputCompareService, private energyInputService: EnergyInputService) { }


  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.lossIndex;
    }
    else {
      this.idString = '_baseline_' + this.lossIndex;
    }
    if (this.energyInputForm.controls.flowRateInput.value) {
      this.flowInput = true;
    }
  }

  setHeatInput() {
    let heatVal: number = this.energyInputService.calculateHeatInputFromFlowRate(this.energyInputForm.controls.flowRateInput.value, this.settings)
    this.energyInputForm.patchValue({
      'naturalGasHeatInput': heatVal
    });
    this.save();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  save() {
    this.saveEmit.emit(true);
    this.calculate.emit(true);
  }

  showHideInputField() {
    this.flowInput = !this.flowInput;
    if (this.flowInput == false) {
      this.energyInputForm.controls.flowRateInput.patchValue(undefined);
    }
    this.save();
  }
  canCompare() {
    if (this.energyInputCompareService.baselineEnergyInput && this.energyInputCompareService.modifiedEnergyInput && !this.inSetup) {
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
