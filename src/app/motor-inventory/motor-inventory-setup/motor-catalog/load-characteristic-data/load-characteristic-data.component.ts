import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LoadCharacteristicOptions, MotorItem, MotorPropertyDisplayOptions } from '../../../motor-inventory';
import { MotorCatalogService } from '../motor-catalog.service';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { LoadCharacteristicDataService } from './load-characteristic-data.service';
import { PsatService } from '../../../../psat/psat.service';

@Component({
  selector: 'app-load-characteristic-data',
  templateUrl: './load-characteristic-data.component.html',
  styleUrls: ['./load-characteristic-data.component.css']
})
export class LoadCharacteristicDataComponent implements OnInit {
  motorForm: FormGroup;
  selectedMotorItemSub: Subscription;
  displayOptions: LoadCharacteristicOptions;
  displayForm: boolean = true;
  selectedMotorItem: MotorItem;
  disableEstimateLoadEfficiency: boolean;

  constructor(private motorCatalogService: MotorCatalogService, 
    private psatService: PsatService,
    private motorInventoryService: MotorInventoryService,
    private loadCharacteristicsDataService: LoadCharacteristicDataService) { }

  ngOnInit(): void {
    this.selectedMotorItemSub = this.motorCatalogService.selectedMotorItem.subscribe(selectedMotor => {
      this.selectedMotorItem = selectedMotor;
      if (selectedMotor) {
        this.motorForm = this.loadCharacteristicsDataService.getFormFromLoadCharacteristicData(selectedMotor.loadCharacteristicData);
      }
    });
    let allDisplayOptions: MotorPropertyDisplayOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions;
    this.displayOptions = allDisplayOptions.loadCharactersticOptions;
    this.disableEstimateLoadEfficiency = !allDisplayOptions.nameplateDataOptions.fullLoadSpeed;
  }

  ngOnDestroy() {
    this.selectedMotorItemSub.unsubscribe();
  }

  save() {
    let selectedMotor: MotorItem = this.motorCatalogService.selectedMotorItem.getValue();
    selectedMotor.loadCharacteristicData = this.loadCharacteristicsDataService.updateLoadCharacteristicDataFromForm(this.motorForm, selectedMotor.loadCharacteristicData);
    this.motorInventoryService.updateMotorItem(selectedMotor);
  }

  focusField(str: string) {
    this.motorInventoryService.focusedDataGroup.next('load-characteristics')
    this.motorInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
    // this.focusOut();
  }

  // focusOut() {
  //   this.motorInventoryService.focusedDataGroup.next('load-characteristics')
  //   this.motorInventoryService.focusedField.next('default');
  // }

  calculateEfficiency75() {
    if (!this.disableEstimateLoadEfficiency) {
      let efficiency: number = this.motorCatalogService.estimateEfficiency(75, true);
      this.motorForm.controls.efficiency75.patchValue(efficiency);
      this.save();
    }
  }
  calculateEfficiency50() {
    if (!this.disableEstimateLoadEfficiency) {
      let efficiency: number = this.motorCatalogService.estimateEfficiency(50, true);
      this.motorForm.controls.efficiency50.patchValue(efficiency);
      this.save();
    }
  }
  calculateEfficiency25() {
    if (!this.disableEstimateLoadEfficiency) {
      let efficiency: number = this.motorCatalogService.estimateEfficiency(25, true);
      this.motorForm.controls.efficiency25.patchValue(efficiency);
      this.save();
    }
  }
  focusHelp(str: string) {
    this.focusField(str);
    this.motorInventoryService.helpPanelTab.next('help');
  }


  calculateMotorPowerFactor25() {
    let powerFactorInput = this.getPowerFactorInput(25, this.motorForm.controls.efficiency25.value);
    let calculatedPowerFactor: number = this.psatService.motorPowerFactor(
      powerFactorInput.motorRatedPower,
      powerFactorInput.loadFactor,
      powerFactorInput.motorCurrent,
      powerFactorInput.motorEfficiency,
      powerFactorInput.ratedVoltage,
      powerFactorInput.settings,
      );
    this.motorForm.controls.powerFactor25.patchValue(calculatedPowerFactor);
    this.save();
  }

  calculateMotorPowerFactor50() {
    let powerFactorInput = this.getPowerFactorInput(50, this.motorForm.controls.efficiency50.value);
    let calculatedPowerFactor: number = this.psatService.motorPowerFactor(
      powerFactorInput.motorRatedPower,
      powerFactorInput.loadFactor,
      powerFactorInput.motorCurrent,
      powerFactorInput.motorEfficiency,
      powerFactorInput.ratedVoltage,
      powerFactorInput.settings,
      );
    this.motorForm.controls.powerFactor50.patchValue(calculatedPowerFactor);
    this.save();
  }

  calculateMotorPowerFactor75() {
    let powerFactorInput = this.getPowerFactorInput(75, this.motorForm.controls.efficiency75.value);
    let calculatedPowerFactor: number = this.psatService.motorPowerFactor(
      powerFactorInput.motorRatedPower,
      powerFactorInput.loadFactor,
      powerFactorInput.motorCurrent,
      powerFactorInput.motorEfficiency,
      powerFactorInput.ratedVoltage,
      powerFactorInput.settings,
      );
    this.motorForm.controls.powerFactor75.patchValue(calculatedPowerFactor);
    this.save();
  }

  calculateMotorPowerFactor100() {
    let powerFactorInput = this.getPowerFactorInput(100, this.selectedMotorItem.nameplateData.nominalEfficiency);
    let calculatedPowerFactor: number = this.psatService.motorPowerFactor(
      powerFactorInput.motorRatedPower,
      powerFactorInput.loadFactor,
      powerFactorInput.motorCurrent,
      powerFactorInput.motorEfficiency,
      powerFactorInput.ratedVoltage,
      powerFactorInput.settings,
      );
    this.motorForm.controls.powerFactor100.patchValue(calculatedPowerFactor);
    this.save();
  }


  getPowerFactorInput(loadFactor: number, motorEfficiency: number) {
    let settings = this.motorInventoryService.settings.getValue();
    let motorCurrent: number = this.motorCatalogService.estimateCurrent(loadFactor, motorEfficiency);
    return {
      motorRatedPower: this.selectedMotorItem.nameplateData.ratedMotorPower,
      loadFactor: loadFactor,
      motorEfficiency: motorEfficiency,
      motorCurrent: motorCurrent,
      ratedVoltage: this.selectedMotorItem.nameplateData.ratedVoltage,
      settings: settings
    }
  }
}
