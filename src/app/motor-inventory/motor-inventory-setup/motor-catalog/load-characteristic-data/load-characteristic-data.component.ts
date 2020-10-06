import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LoadCharacteristicOptions, MotorItem, MotorPropertyDisplayOptions } from '../../../motor-inventory';
import { MotorCatalogService } from '../motor-catalog.service';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { LoadCharacteristicDataService } from './load-characteristic-data.service';

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
  constructor(private motorCatalogService: MotorCatalogService, private motorInventoryService: MotorInventoryService,
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
}
