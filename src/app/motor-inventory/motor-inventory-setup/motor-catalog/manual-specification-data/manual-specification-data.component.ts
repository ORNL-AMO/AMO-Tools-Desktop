import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ManualSpecificationOptions, MotorItem } from '../../../motor-inventory';
import { MotorCatalogService } from '../motor-catalog.service';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { ManualSpecificationDataService } from './manual-specification-data.service';

@Component({
  selector: 'app-manual-specification-data',
  templateUrl: './manual-specification-data.component.html',
  styleUrls: ['./manual-specification-data.component.css']
})
export class ManualSpecificationDataComponent implements OnInit {

  motorForm: UntypedFormGroup;
  selectedMotorItemSub: Subscription;
  motorInventoryDataSub: Subscription;
  displayOptions: ManualSpecificationOptions;
  displayForm: boolean = true;
  polesOptions: Array<number> = [2, 4, 6, 8, 10, 12];
  synchronousSpeedOptions: Array<number>;
  selectedMotorItem: MotorItem;
  constructor(private motorCatalogService: MotorCatalogService, private motorInventoryService: MotorInventoryService,
    private manualSpecificationDataService: ManualSpecificationDataService) { }

  ngOnInit(): void {
    //updates when selected motor changes by selection
    this.selectedMotorItemSub = this.motorCatalogService.selectedMotorItem.subscribe(selectedMotor => {
      if (selectedMotor) {
        this.motorForm = this.manualSpecificationDataService.getFormFromManualSpecificationData(selectedMotor.manualSpecificationData);
      }
    });
    //updates on all motor changes
    this.motorInventoryDataSub = this.motorInventoryService.motorInventoryData.subscribe(motorInventoryData => {
      if (motorInventoryData) {
        this.selectedMotorItem = this.motorCatalogService.getUpdatedSelectedMotorItem();
        if (this.selectedMotorItem) {
          if (this.selectedMotorItem.nameplateData.lineFrequency == 60) {
            this.synchronousSpeedOptions = [900, 1200, 1800, 3600];
          } else if (this.selectedMotorItem.nameplateData.lineFrequency == 50) {
            this.synchronousSpeedOptions = [1000, 1500, 3000];
          }
        }
      }
    })
    this.displayOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.manualSpecificationOptions;
  }

  ngOnDestroy() {
    this.selectedMotorItemSub.unsubscribe();
    this.motorInventoryDataSub.unsubscribe();
  }

  save() {
    let selectedMotor: MotorItem = this.motorCatalogService.selectedMotorItem.getValue();
    selectedMotor.manualSpecificationData = this.manualSpecificationDataService.updateManualDataFromForm(this.motorForm, selectedMotor.manualSpecificationData);
    this.motorInventoryService.updateMotorItem(selectedMotor);
  }

  focusField(str: string) {
    this.motorInventoryService.focusedDataGroup.next('manual-specifications');
    this.motorInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
    // this.focusOut();
  }

  // focusOut() {
  //   this.motorInventoryService.focusedDataGroup.next('manual-specifications')
  //   this.motorInventoryService.focusedField.next('default');
  // }
}
